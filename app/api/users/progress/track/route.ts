import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { topicId, completed } = await request.json();

    if (!topicId || typeof topicId !== "string") {
      return NextResponse.json({ error: "topicId is required" }, { status: 400 });
    }

    const progress = await prisma.learningProgress.upsert({
      where: {
        userId_topicId: {
          userId: session.user.id,
          topicId,
        },
      },
      update: {
        viewCount: { increment: 1 },
        lastViewAt: new Date(),
        ...(completed !== undefined ? { completed } : {}),
      },
      create: {
        userId: session.user.id,
        topicId,
        viewCount: 1,
        completed: completed ?? false,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    return handleApiError(error);
  }
}
