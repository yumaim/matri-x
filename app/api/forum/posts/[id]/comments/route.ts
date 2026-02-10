import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createCommentSchema } from "@/lib/validations/forum";
import { checkRateLimit } from "@/lib/rate-limit";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/forum/posts/[id]/comments — コメント一覧
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();

    // Get top-level comments with nested replies
    const comments = await prisma.comment.findMany({
      where: {
        postId: id,
        parentId: null, // top-level only
      },
      orderBy: { createdAt: "asc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
        votes: session?.user?.id
          ? {
              where: { userId: session.user.id },
              select: { value: true },
            }
          : false,
        _count: {
          select: { votes: true },
        },
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
                role: true,
              },
            },
            votes: session?.user?.id
              ? {
                  where: { userId: session.user.id },
                  select: { value: true },
                }
              : false,
            _count: {
              select: { votes: true },
            },
            replies: {
              orderBy: { createdAt: "asc" },
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    role: true,
                  },
                },
                _count: {
                  select: { votes: true },
                },
              },
            },
          },
        },
      },
    });

    // Get vote scores for all comments
    const allCommentIds = collectCommentIds(comments);
    const voteSums = allCommentIds.length > 0
      ? await prisma.vote.groupBy({
          by: ["commentId"],
          where: { commentId: { in: allCommentIds } },
          _sum: { value: true },
        })
      : [];
    const voteMap = new Map(voteSums.map((v) => [v.commentId, v._sum.value ?? 0]));

    const enriched = enrichComments(comments, voteMap);

    return NextResponse.json({ comments: enriched });
  } catch (error) {
    console.error("GET /api/forum/posts/[id]/comments error:", error);
    return NextResponse.json(
      { error: "コメントの取得に失敗しました" },
      { status: 500 }
    );
  }
}

// POST /api/forum/posts/[id]/comments — コメント追加
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { allowed } = checkRateLimit(`comment:${session.user.id}`, 20, 60000);
    if (!allowed) {
      return NextResponse.json({ error: "リクエストが多すぎます" }, { status: 429 });
    }

    // Check post exists
    const post = await prisma.forumPost.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!post || post.status !== "PUBLISHED") {
      return NextResponse.json({ error: "投稿が見つかりません" }, { status: 404 });
    }

    const body = await request.json();
    const data = createCommentSchema.parse(body);

    // If replying, check parent comment exists and belongs to same post
    if (data.parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: data.parentId },
        select: { postId: true },
      });

      if (!parent || parent.postId !== id) {
        return NextResponse.json(
          { error: "返信先のコメントが見つかりません" },
          { status: 404 }
        );
      }
    }

    // Sanitize user content (H-7)
    const { sanitizeContent } = await import("@/lib/sanitize");

    const comment = await prisma.comment.create({
      data: {
        content: sanitizeContent(data.content),
        authorId: session.user.id,
        postId: id,
        parentId: data.parentId ?? null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        ...comment,
        voteScore: 0,
        userVote: null,
        replies: [],
        _count: { votes: 0 },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "バリデーションエラー", details: error }, { status: 400 });
    }
    console.error("POST /api/forum/posts/[id]/comments error:", error);
    return NextResponse.json(
      { error: "コメントの作成に失敗しました" },
      { status: 500 }
    );
  }
}

// Helper: collect all comment IDs recursively
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function collectCommentIds(comments: any[]): string[] {
  const ids: string[] = [];
  for (const c of comments) {
    ids.push(c.id);
    if (c.replies) {
      ids.push(...collectCommentIds(c.replies));
    }
  }
  return ids;
}

// Helper: enrich comments with vote scores
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function enrichComments(comments: any[], voteMap: Map<string | null, number>): any[] {
  return comments.map((c) => ({
    ...c,
    voteScore: voteMap.get(c.id) ?? 0,
    userVote: c.votes?.[0]?.value ?? null,
    replies: c.replies ? enrichComments(c.replies, voteMap) : [],
  }));
}

// DELETE /api/forum/posts/[id]/comments?commentId=xxx — コメント削除
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const commentId = request.nextUrl.searchParams.get("commentId");
    if (!commentId) {
      return NextResponse.json({ error: "commentId is required" }, { status: 400 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true },
    });

    if (!comment) {
      return NextResponse.json({ error: "コメントが見つかりません" }, { status: 404 });
    }

    if (comment.authorId !== session.user.id) {
      return NextResponse.json({ error: "削除権限がありません" }, { status: 403 });
    }

    await prisma.comment.delete({ where: { id: commentId } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }
}
