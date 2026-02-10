import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30"; // 7, 30, all

    // Calculate date filter
    let dateFilter: Date | undefined;
    if (period === "7") {
      dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === "30") {
      dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }
    // "all" → no date filter

    const dateWhere = dateFilter ? { gte: dateFilter } : undefined;

    // Run all queries in parallel
    const [
      totalPosts,
      totalComments,
      receivedLikes,
      receivedBookmarks,
      simulationCount,
      completedTopics,
      totalXP,
      achievementCount,
      // For graph data
      posts,
      comments,
      // Popular posts
      popularPosts,
      // Engagement averages
      allPosts,
    ] = await Promise.all([
      // Overview cards
      prisma.forumPost.count({
        where: { authorId: userId, ...(dateWhere ? { createdAt: dateWhere } : {}) },
      }),
      prisma.comment.count({
        where: { authorId: userId, ...(dateWhere ? { createdAt: dateWhere } : {}) },
      }),
      prisma.vote.count({
        where: {
          post: { authorId: userId },
          value: 1,
          ...(dateWhere ? { createdAt: dateWhere } : {}),
        },
      }),
      prisma.bookmark.count({
        where: {
          post: { authorId: userId },
          ...(dateWhere ? { createdAt: dateWhere } : {}),
        },
      }),
      // Simulation count
      prisma.simulation.count({
        where: { userId, ...(dateWhere ? { createdAt: dateWhere } : {}) },
      }),
      // Learning progress
      prisma.learningProgress.count({
        where: { userId, completed: true },
      }),
      prisma.learningProgress.aggregate({
        where: { userId },
        _sum: { viewCount: true },
      }),
      prisma.userAchievement.count({
        where: { userId },
      }),
      // Daily post data (for graph, always 30 days)
      prisma.forumPost.findMany({
        where: {
          authorId: userId,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      // Daily comment data (for graph, always 30 days)
      prisma.comment.findMany({
        where: {
          authorId: userId,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      // Popular posts (top 5 by voteScore + viewCount)
      prisma.forumPost.findMany({
        where: { authorId: userId },
        select: {
          id: true,
          title: true,
          viewCount: true,
          createdAt: true,
          _count: {
            select: { comments: true, votes: true, bookmarks: true },
          },
          votes: {
            select: { value: true },
          },
        },
        orderBy: { viewCount: "desc" },
        take: 10,
      }),
      // All posts for engagement calculation
      prisma.forumPost.findMany({
        where: { authorId: userId, ...(dateWhere ? { createdAt: dateWhere } : {}) },
        select: {
          _count: { select: { comments: true, votes: true } },
        },
      }),
    ]);

    // Build daily activity data (30 days)
    const dailyMap: Record<string, { posts: number; comments: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      dailyMap[key] = { posts: 0, comments: 0 };
    }
    for (const p of posts) {
      const key = new Date(p.createdAt).toISOString().slice(0, 10);
      if (dailyMap[key]) dailyMap[key].posts++;
    }
    for (const c of comments) {
      const key = new Date(c.createdAt).toISOString().slice(0, 10);
      if (dailyMap[key]) dailyMap[key].comments++;
    }
    const dailyActivity = Object.entries(dailyMap).map(([date, data]) => ({
      date,
      posts: data.posts,
      comments: data.comments,
    }));

    // Rank popular posts by voteScore + viewCount
    const rankedPosts = popularPosts
      .map((p) => {
        const voteScore = p.votes.reduce((sum, v) => sum + v.value, 0);
        return {
          id: p.id,
          title: p.title,
          viewCount: p.viewCount,
          voteScore,
          commentCount: p._count.comments,
          bookmarkCount: p._count.bookmarks,
          createdAt: p.createdAt,
        };
      })
      .sort((a, b) => b.voteScore + b.viewCount - (a.voteScore + a.viewCount))
      .slice(0, 5);

    // Engagement rate
    const totalPostCount = allPosts.length;
    const avgComments = totalPostCount > 0
      ? allPosts.reduce((sum, p) => sum + p._count.comments, 0) / totalPostCount
      : 0;
    const avgVotes = totalPostCount > 0
      ? allPosts.reduce((sum, p) => sum + p._count.votes, 0) / totalPostCount
      : 0;

    // XP & Level — compute XP from completed topics (100 XP each) + viewCount
    const completedXP = completedTopics * 100;
    const viewXP = totalXP._sum.viewCount ?? 0;
    const xp = completedXP + viewXP * 10;
    const level = Math.floor(xp / 100) + 1;

    return NextResponse.json({
      overview: {
        totalPosts,
        totalComments,
        receivedLikes,
        receivedBookmarks,
      },
      dailyActivity,
      popularPosts: rankedPosts,
      engagement: {
        avgCommentsPerPost: Math.round(avgComments * 100) / 100,
        avgVotesPerPost: Math.round(avgVotes * 100) / 100,
      },
      simulation: {
        count: simulationCount,
      },
      learning: {
        completedTopics,
        totalXP: xp,
        level,
        achievementCount,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
