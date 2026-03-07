import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createWhisperSchema, whisperQuerySchema } from "@/lib/validations/whisper";
import { checkRateLimit } from "@/lib/rate-limit";

// GET /api/whispers — cursor-based タイムライン取得
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);

    const query = whisperQuerySchema.parse({
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    const whispers = await prisma.whisper.findMany({
      take: query.limit + 1, // 1件多く取得して nextCursor を判定
      ...(query.cursor
        ? {
            cursor: { id: query.cursor },
            skip: 1, // cursor自体はスキップ
          }
        : {}),
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
            xHandle: true,
          },
        },
        reactions: {
          select: {
            id: true,
            emoji: true,
            userId: true,
          },
        },
      },
    });

    let nextCursor: string | null = null;
    if (whispers.length > query.limit) {
      const nextItem = whispers.pop();
      nextCursor = nextItem!.id;
    }

    // Transform reactions into grouped counts
    const transformedWhispers = whispers.map((w) => {
      const reactionCounts: Record<string, number> = {};
      const userReactions: string[] = [];

      w.reactions.forEach((r) => {
        reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
        if (session?.user?.id && r.userId === session.user.id) {
          userReactions.push(r.emoji);
        }
      });

      return {
        id: w.id,
        content: w.content,
        createdAt: w.createdAt,
        author: w.author,
        reactionCounts,
        userReactions,
        totalReactions: w.reactions.length,
      };
    });

    return NextResponse.json({
      whispers: transformedWhispers,
      nextCursor,
    });
  } catch (error) {
    console.error("GET /api/whispers error:", error);
    return NextResponse.json(
      { error: "囁きの取得に失敗しました" },
      { status: 500 }
    );
  }
}

// POST /api/whispers — 新規囁き投稿
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { allowed } = checkRateLimit(`whisper:${session.user.id}`, 20, 60000);
    if (!allowed) {
      return NextResponse.json(
        { error: "リクエストが多すぎます。しばらく待ってから再試行してください。" },
        { status: 429 }
      );
    }

    // 1日5件制限 (JST)
    const jstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
    const todayStart = new Date(jstNow.getFullYear(), jstNow.getMonth(), jstNow.getDate());
    const todayStartUTC = new Date(todayStart.getTime() - 9 * 60 * 60 * 1000);
    const todayEndUTC = new Date(todayStartUTC.getTime() + 24 * 60 * 60 * 1000);

    const todayCount = await prisma.whisper.count({
      where: {
        authorId: session.user.id,
        createdAt: { gte: todayStartUTC, lt: todayEndUTC },
      },
    });

    if (todayCount >= 5) {
      return NextResponse.json(
        { error: "囁きは1日5回までです。明日またお待ちしています！" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const data = createWhisperSchema.parse(body);

    const { sanitizeContent } = await import("@/lib/sanitize");

    const whisper = await prisma.whisper.create({
      data: {
        content: sanitizeContent(data.content),
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
            xHandle: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        ...whisper,
        reactionCounts: {},
        userReactions: [],
        totalReactions: 0,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "バリデーションエラー", details: error },
        { status: 400 }
      );
    }
    console.error("POST /api/whispers error:", error);
    return NextResponse.json(
      { error: "囁きの投稿に失敗しました" },
      { status: 500 }
    );
  }
}
