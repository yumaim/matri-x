import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updatePostSchema } from "@/lib/validations/forum";
import { checkRateLimit } from "@/lib/rate-limit";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/forum/posts/[id] — 投稿詳細
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();

    const post = await prisma.forumPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
            bio: true,
            xHandle: true,
          },
        },
        evidence: {
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            comments: true,
            votes: true,
            bookmarks: true,
            evidence: true,
          },
        },
        votes: session?.user?.id
          ? {
              where: { userId: session.user.id },
              select: { value: true },
            }
          : false,
        bookmarks: session?.user?.id
          ? {
              where: { userId: session.user.id },
              select: { id: true },
            }
          : false,
      },
    });

    if (!post || (post.status !== "PUBLISHED" && post.authorId !== session?.user?.id)) {
      return NextResponse.json({ error: "投稿が見つかりません" }, { status: 404 });
    }

    // Increment view count (debounced per user per post, 5 min window)
    const viewKey = `view:${session?.user?.id ?? "anon"}:${id}`;
    const { allowed: viewAllowed } = checkRateLimit(viewKey, 1, 300000);
    if (viewAllowed) {
      await prisma.forumPost.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });
    }

    // Get vote score
    const voteSum = await prisma.vote.aggregate({
      where: { postId: id },
      _sum: { value: true },
    });

    // Parse tags
    let tags: string[] = [];
    try {
      tags = JSON.parse(post.tags);
    } catch {
      tags = [];
    }

    // Parse evidence data
    const evidence = post.evidence.map((e) => ({
      ...e,
      beforeData: e.beforeData ? (() => { try { return JSON.parse(e.beforeData); } catch { return e.beforeData; } })() : null,
      afterData: e.afterData ? (() => { try { return JSON.parse(e.afterData); } catch { return e.afterData; } })() : null,
    }));

    // Get related posts
    const relatedPosts = await prisma.forumPost.findMany({
      where: {
        id: { not: id },
        status: "PUBLISHED",
        category: post.category,
      },
      take: 5,
      orderBy: { viewCount: "desc" },
      select: {
        id: true,
        title: true,
        category: true,
        viewCount: true,
        createdAt: true,
        _count: {
          select: { comments: true, votes: true },
        },
      },
    });

    return NextResponse.json({
      ...post,
      tags,
      evidence,
      voteScore: voteSum._sum.value ?? 0,
      userVote: post.votes?.[0]?.value ?? null,
      isBookmarked: (post.bookmarks?.length ?? 0) > 0,
      viewCount: post.viewCount + 1,
      relatedPosts,
    });
  } catch (error) {
    console.error("GET /api/forum/posts/[id] error:", error);
    return NextResponse.json(
      { error: "投稿の取得に失敗しました" },
      { status: 500 }
    );
  }
}

// PUT /api/forum/posts/[id] — 投稿編集
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.forumPost.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "投稿が見つかりません" }, { status: 404 });
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    const body = await request.json();
    const data = updatePostSchema.parse(body);

    const updateData: Record<string, unknown> = { ...data };
    if (data.tags) {
      updateData.tags = JSON.stringify(data.tags);
    }

    const updated = await prisma.forumPost.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: { id: true, name: true, image: true, role: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "バリデーションエラー", details: error }, { status: 400 });
    }
    console.error("PUT /api/forum/posts/[id] error:", error);
    return NextResponse.json(
      { error: "投稿の更新に失敗しました" },
      { status: 500 }
    );
  }
}

// DELETE /api/forum/posts/[id] — 投稿削除
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.forumPost.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "投稿が見つかりません" }, { status: 404 });
    }

    // Author or admin/moderator can delete
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (post.authorId !== session.user.id && user?.role === "USER") {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    await prisma.forumPost.update({
      where: { id },
      data: { status: "REMOVED" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/forum/posts/[id] error:", error);
    return NextResponse.json(
      { error: "投稿の削除に失敗しました" },
      { status: 500 }
    );
  }
}
