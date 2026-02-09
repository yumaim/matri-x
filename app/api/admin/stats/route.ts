import { NextResponse } from "next/server";
import { requireAdmin, handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [userCount, postCount, commentCount, todayUsers, recentPosts, categoryStats] =
      await Promise.all([
        prisma.user.count(),
        prisma.forumPost.count(),
        prisma.comment.count(),
        prisma.user.count({ where: { createdAt: { gte: today } } }),
        prisma.forumPost.findMany({
          where: { status: "FLAGGED" },
          include: { author: { select: { name: true, email: true } } },
          orderBy: { updatedAt: "desc" },
          take: 5,
        }),
        prisma.forumPost.groupBy({
          by: ["category"],
          _count: { id: true },
        }),
      ]);

    return NextResponse.json({
      userCount,
      postCount,
      commentCount,
      todayUsers,
      flaggedPosts: recentPosts,
      categoryStats: categoryStats.map((c) => ({
        category: c.category,
        count: c._count.id,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
