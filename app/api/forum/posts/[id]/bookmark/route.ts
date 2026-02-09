import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/forum/posts/[id]/bookmark — ブックマーク（トグル）
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check post exists
    const post = await prisma.forumPost.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "投稿が見つかりません" }, { status: 404 });
    }

    // Check existing bookmark
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: id,
        },
      },
    });

    let isBookmarked: boolean;

    if (existingBookmark) {
      await prisma.bookmark.delete({
        where: { id: existingBookmark.id },
      });
      isBookmarked = false;
    } else {
      await prisma.bookmark.create({
        data: {
          userId: session.user.id,
          postId: id,
        },
      });
      isBookmarked = true;
    }

    return NextResponse.json({ isBookmarked });
  } catch (error) {
    console.error("POST /api/forum/posts/[id]/bookmark error:", error);
    return NextResponse.json(
      { error: "ブックマーク操作に失敗しました" },
      { status: 500 }
    );
  }
}
