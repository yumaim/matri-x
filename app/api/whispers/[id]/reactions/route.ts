import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { whisperReactionSchema } from "@/lib/validations/whisper";

// POST /api/whispers/:id/reactions — リアクション追加/トグル
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: whisperId } = await params;

    // 囁きの存在確認
    const whisper = await prisma.whisper.findUnique({
      where: { id: whisperId },
    });
    if (!whisper) {
      return NextResponse.json(
        { error: "囁きが見つかりません" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { emoji } = whisperReactionSchema.parse(body);

    // トグル: 既存なら削除、なければ追加
    const existing = await prisma.whisperReaction.findUnique({
      where: {
        whisperId_userId_emoji: {
          whisperId,
          userId: session.user.id,
          emoji,
        },
      },
    });

    if (existing) {
      await prisma.whisperReaction.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ action: "removed", emoji });
    } else {
      await prisma.whisperReaction.create({
        data: {
          whisperId,
          userId: session.user.id,
          emoji,
        },
      });
      return NextResponse.json({ action: "added", emoji });
    }
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "バリデーションエラー", details: error },
        { status: 400 }
      );
    }
    console.error("POST /api/whispers/:id/reactions error:", error);
    return NextResponse.json(
      { error: "リアクションの処理に失敗しました" },
      { status: 500 }
    );
  }
}
