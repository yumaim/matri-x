import { NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requireAuth();

    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          image: true,
          company: true,
          xHandle: true,
          role: true,
          _count: {
            select: {
              posts: true,
              comments: true,
              votes: true,
            },
          },
        },
      }),
      prisma.user.count(),
    ]);

    // Composite score: posts×3 + comments×2 + votes×1
    // ADMIN/MODERATOR users get ×0.1 multiplier to prevent
    // admin activity from dominating the ranking
    const ADMIN_MULTIPLIER = 0.1;
    const scored = users
      .map((u) => {
        const rawScore = u._count.posts * 3 + u._count.comments * 2 + u._count.votes * 1;
        const multiplier = (u.role === "ADMIN" || u.role === "MODERATOR") ? ADMIN_MULTIPLIER : 1;
        return {
          ...u,
          _score: Math.round(rawScore * multiplier),
        };
      })
      .sort((a, b) => b._score - a._score);

    // Strip internal score and role before returning
    const result = scored.map(({ _score, role, ...rest }) => rest);

    return NextResponse.json({ users: result, totalUsers });
  } catch (error) {
    return handleApiError(error);
  }
}
