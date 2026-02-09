import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
}
