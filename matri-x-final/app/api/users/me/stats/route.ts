import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    const [simulationCount, postCount, commentCount, receivedVotes] =
      await Promise.all([
        prisma.simulation.count({
          where: { userId },
        }),
        prisma.forumPost.count({
          where: { authorId: userId },
        }),
        prisma.comment.count({
          where: { authorId: userId },
        }),
        // Count votes received on user's posts and comments
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
    console.error("Failed to fetch user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}
