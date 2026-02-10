import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { requireAuth, handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

const VALID_REACTION_TYPES = ["WANT_MORE", "DISCOVERY", "CONSULT"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const rl = checkRateLimit(`react:${session.user.id}`, 60, 60000);
    if (!rl.allowed) { return NextResponse.json({ error: "リクエスト制限を超えました" }, { status: 429 }); }
    const { id: postId } = await params;
    const { type } = await request.json();

    if (!VALID_REACTION_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 });
    }

    // Check if post exists
    const post = await prisma.forumPost.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user already reacted with this type
    const existingVote = await prisma.vote.findFirst({
      where: {
        userId: session.user.id,
        postId,
        type,
      },
    });

    if (existingVote) {
      // Remove reaction (toggle off)
      await prisma.vote.delete({ where: { id: existingVote.id } });
    } else {
      // Add reaction
      await prisma.vote.create({
        data: {
          value: 1,
          type,
          userId: session.user.id,
          postId,
        },
      });
    }

    // Get updated counts
    const reactionCounts = await getReactionCounts(postId);
    const userReactions = await getUserReactions(session.user.id, postId);

    return NextResponse.json({
      reactions: reactionCounts,
      userReactions,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

async function getReactionCounts(postId: string) {
  const counts: Record<string, number> = {
    WANT_MORE: 0,
    DISCOVERY: 0,
    CONSULT: 0,
  };

  const votes = await prisma.vote.groupBy({
    by: ["type"],
    where: { postId, type: { in: VALID_REACTION_TYPES } },
    _count: { id: true },
  });

  for (const vote of votes) {
    counts[vote.type] = vote._count.id;
  }

  return counts;
}

async function getUserReactions(userId: string, postId: string) {
  const votes = await prisma.vote.findMany({
    where: { userId, postId, type: { in: VALID_REACTION_TYPES } },
    select: { type: true },
  });
  return votes.map((v) => v.type);
}
