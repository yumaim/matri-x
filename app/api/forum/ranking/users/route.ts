import { NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requireAuth();

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        company: true,
        xHandle: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            votes: true,
          },
        },
      },
      take: 50,
    });

    // Composite score: posts×3 + comments×2 + votes×1
    // Active users (higher score) rank above inactive users
    const scored = users
      .map((u) => ({
        ...u,
        _score: u._count.posts * 3 + u._count.comments * 2 + u._count.votes * 1,
      }))
      .sort((a, b) => b._score - a._score)
      .slice(0, 20);

    // Strip internal score before returning
    const result = scored.map(({ _score, ...rest }) => rest);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
