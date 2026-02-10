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
      orderBy: {
        posts: { _count: "desc" },
      },
      take: 20,
    });

    return NextResponse.json(users);
  } catch (error) {
    return handleApiError(error);
  }
}
