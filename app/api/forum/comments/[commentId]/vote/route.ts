import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { voteSchema } from "@/lib/validations/forum";

type RouteParams = { params: Promise<{ commentId: string }> };

// POST /api/forum/comments/[commentId]/vote — コメント投票（トグル）
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { commentId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { value } = voteSchema.parse(body);

    // Check comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true },
    });

    if (!comment) {
      return NextResponse.json({ error: "コメントが見つかりません" }, { status: 404 });
    }

    // Check existing vote on this comment
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId,
        },
      },
    });

    let action: "created" | "removed" | "updated";

    if (existingVote) {
      if (existingVote.value === value) {
        // Same vote — toggle off
        await prisma.vote.delete({
          where: { id: existingVote.id },
        });
        action = "removed";
      } else {
        // Different vote — update
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { value, type: value > 0 ? "UPVOTE" : "DOWNVOTE" },
        });
        action = "updated";
      }
    } else {
      // New vote
      await prisma.vote.create({
        data: {
          value,
          type: value > 0 ? "UPVOTE" : "DOWNVOTE",
          userId: session.user.id,
          commentId,
        },
      });
      action = "created";
    }

    // Get new score
    const voteSum = await prisma.vote.aggregate({
      where: { commentId },
      _sum: { value: true },
    });

    // Get user's current vote
    const userVote = await prisma.vote.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId,
        },
      },
      select: { value: true },
    });

    return NextResponse.json({
      action,
      voteScore: voteSum._sum.value ?? 0,
      userVote: userVote?.value ?? null,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "バリデーションエラー" }, { status: 400 });
    }
    console.error("POST /api/forum/comments/[commentId]/vote error:", error);
    return NextResponse.json(
      { error: "投票に失敗しました" },
      { status: 500 }
    );
  }
}
