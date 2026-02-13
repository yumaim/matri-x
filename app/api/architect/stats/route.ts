import { NextResponse } from "next/server";
import { requireAdmin, handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin();

    const [totalUsers, bannedUsers, totalPosts, totalComments, totalVotes, openTickets, totalTickets, recentSignups] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { banned: true } }),
        prisma.forumPost.count(),
        prisma.comment.count(),
        prisma.vote.count(),
        prisma.ticket.count({ where: { status: "OPEN" } }),
        prisma.ticket.count(),
        prisma.user.findMany({
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { id: true, name: true, email: true, createdAt: true },
        }),
      ]);

    // Active users = logged in within 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = await prisma.user.count({
      where: { updatedAt: { gte: thirtyDaysAgo } },
    });

    // Time-series: signups per day for the last 30 days
    const signupsByDay = await getSignupsByDay(30);

    // Time-series: posts per day for the last 30 days
    const postsByDay = await getPostsByDay(30);

    // Plan distribution
    const planDistribution = await prisma.user.groupBy({
      by: ["plan"],
      _count: true,
    });

    return NextResponse.json({
      totalUsers,
      activeUsers,
      bannedUsers,
      totalPosts,
      totalComments,
      totalVotes,
      openTickets,
      totalTickets,
      recentSignups,
      signupsByDay,
      postsByDay,
      planDistribution: planDistribution.map((p: { plan: string; _count: number }) => ({
        plan: p.plan,
        count: p._count,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

async function getSignupsByDay(days: number) {
  const result: { date: string; count: number }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const dayStart = new Date(now);
    dayStart.setDate(dayStart.getDate() - i);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const count = await prisma.user.count({
      where: { createdAt: { gte: dayStart, lt: dayEnd } },
    });
    result.push({
      date: dayStart.toISOString().slice(5, 10), // MM-DD
      count,
    });
  }
  return result;
}

async function getPostsByDay(days: number) {
  const result: { date: string; count: number }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const dayStart = new Date(now);
    dayStart.setDate(dayStart.getDate() - i);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const count = await prisma.forumPost.count({
      where: { createdAt: { gte: dayStart, lt: dayEnd } },
    });
    result.push({
      date: dayStart.toISOString().slice(5, 10),
      count,
    });
  }
  return result;
}
