import { NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const [simulationCount, postCount, commentCount, receivedVotes] =
      await Promise.all([
        prisma.simulation.count({ where: { userId } }),
        prisma.forumPost.count({ where: { authorId: userId } }),
        prisma.comment.count({ where: { authorId: userId } }),
        prisma.vote.count({
          where: {
            OR: [
              { post: { authorId: userId } },
              { comment: { authorId: userId } },
            ],
          },
        }),
      ]);

    return NextResponse.json({
      simulationCount,
      postCount,
      commentCount,
      receivedVotes,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
