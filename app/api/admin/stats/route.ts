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
    });
  } catch (error) {
    return handleApiError(error);
  }
}
