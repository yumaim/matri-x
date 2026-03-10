import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createEvidenceSchema } from "@/lib/validations/forum";

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/forum/posts/[id]/evidence — 検証エビデンス追加
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
      select: { id: true, status: true },
    });

    if (!post || post.status !== "PUBLISHED") {
      return NextResponse.json({ error: "投稿が見つかりません" }, { status: 404 });
    }

    const body = await request.json();
    const data = createEvidenceSchema.parse(body);

    const evidence = await prisma.evidence.create({
      data: {
        postId: id,
        type: data.type,
        description: data.description,
        beforeData: data.beforeData ? JSON.stringify(data.beforeData) : null,
        afterData: data.afterData ? JSON.stringify(data.afterData) : null,
        conclusion: data.conclusion ?? null,
      },
    });

    return NextResponse.json(
      {
        ...evidence,
        beforeData: data.beforeData ?? null,
        afterData: data.afterData ?? null,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "バリデーションエラー", details: error }, { status: 400 });
    }
    console.error("POST /api/forum/posts/[id]/evidence error:", error);
    return NextResponse.json(
      { error: "エビデンスの追加に失敗しました" },
      { status: 500 }
    );
  }
}
