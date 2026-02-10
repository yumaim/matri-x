import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        image: true,
        role: true,
        plan: true,
        company: true,
        bio: true,
        website: true,
        xHandle: true,
        headerColor: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
    }

    // Learning stats
    const [xpAgg, completedTopics, achievementCount] = await Promise.all([
      prisma.learningProgress.aggregate({
        where: { userId: id },
        _sum: { viewCount: true },
      }),
      prisma.learningProgress.count({
        where: { userId: id, completed: true },
      }),
      prisma.userAchievement.count({
        where: { userId: id },
      }),
    ]);

    const completedXP = completedTopics * 100;
    const viewXP = xpAgg._sum.viewCount ?? 0;
    const xp = completedXP + viewXP * 10;
    const level = Math.floor(xp / 100) + 1;

    // User posts
    const posts = await prisma.forumPost.findMany({
      where: { authorId: id, status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        category: true,
        viewCount: true,
        createdAt: true,
        _count: { select: { comments: true, votes: true } },
        votes: { select: { value: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const postsWithScore = posts.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      viewCount: p.viewCount,
      voteScore: p.votes.reduce((s, v) => s + v.value, 0),
      commentCount: p._count.comments,
      createdAt: p.createdAt,
    }));

    // User comments
    const userComments = await prisma.comment.findMany({
      where: { authorId: id },
      select: {
        id: true,
        content: true,
        createdAt: true,
        post: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // User achievements
    const achievements = await prisma.userAchievement.findMany({
      where: { userId: id },
      select: {
        achievementId: true,
        unlockedAt: true,
      },
      orderBy: { unlockedAt: "desc" },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        image: user.image,
        role: user.role,
        plan: user.plan,
        company: user.company,
        bio: user.bio,
        website: user.website,
        xHandle: user.xHandle,
        headerColor: user.headerColor,
        createdAt: user.createdAt,
      },
      stats: {
        postCount: user._count.posts,
        commentCount: user._count.comments,
        level,
        xp,
        completedTopics,
        achievementCount,
      },
      posts: postsWithScore,
      comments: userComments,
      achievements,
    });
  } catch (error) {
    console.error("User profile API error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
