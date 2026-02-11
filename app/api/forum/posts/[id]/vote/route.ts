import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { voteSchema } from "@/lib/validations/forum";
import { notifyOnPostVote } from "@/lib/notifications";

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/forum/posts/[id]/vote — 投票（トグル）
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { value } = voteSchema.parse(body);

    // Check post exists
    const post = await prisma.forumPost.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "投稿が見つかりません" }, { status: 404 });
    }

    // Check existing UPVOTE or DOWNVOTE
    const existingVote = await prisma.vote.findFirst({
      where: {
        userId: session.user.id,
        postId: id,
        type: { in: ["UPVOTE", "DOWNVOTE"] },
      },
    });

    let action: "created" | "removed" | "updated";

    if (existingVote) {
      if (existingVote.value === value) {
        // Same vote — remove (toggle off)
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
          postId: id,
        },
      });
      action = "created";
    }

    // Get new score
    const voteSum = await prisma.vote.aggregate({
      where: { postId: id, type: { in: ["UPVOTE", "DOWNVOTE"] } },
      _sum: { value: true },
    });

    // Get user's current vote
    const userVote = await prisma.vote.findFirst({
      where: {
        userId: session.user.id,
        postId: id,
        type: { in: ["UPVOTE", "DOWNVOTE"] },
      },
      select: { value: true },
    });

    // Notify on upvote (fire-and-forget)
    if (action === "created" && value > 0) {
      const postForNotif = await prisma.forumPost.findUnique({
        where: { id },
        select: { title: true },
      });
      const voter = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true },
      });
      if (postForNotif) {
        notifyOnPostVote({
          postId: id,
          voterId: session.user.id,
          voterName: voter?.name ?? "ユーザー",
          postTitle: postForNotif.title,
          value,
        }).catch(() => {});
      }
    }

    return NextResponse.json({
      action,
      voteScore: voteSum._sum.value ?? 0,
      userVote: userVote?.value ?? null,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "バリデーションエラー" }, { status: 400 });
    }
    console.error("POST /api/forum/posts/[id]/vote error:", error);
    return NextResponse.json(
      { error: "投票に失敗しました" },
      { status: 500 }
    );
  }
}
