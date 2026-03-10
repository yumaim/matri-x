import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { callGemini } from "@/lib/gemini";

export const runtime = "nodejs";

/**
 * AI Thread Activator API (Gemini)
 * Detects stale threads and suggests engagement prompts.
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "MODERATOR"].includes((session.user as { role?: string }).role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const staleThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const staleThreads = await prisma.forumPost.findMany({
      where: {
        status: "PUBLISHED",
        createdAt: { gte: threeDaysAgo },
        updatedAt: { lt: staleThreshold },
        comments: { none: { createdAt: { gte: staleThreshold } } },
      },
      include: {
        author: { select: { name: true } },
        _count: { select: { comments: true, votes: true } },
      },
      orderBy: { viewCount: "desc" },
      take: 10,
    });

    const threadData = staleThreads.map((t) => ({
      id: t.id, title: t.title, category: t.category,
      author: t.author.name, voteCount: t._count.votes,
      commentCount: t._count.comments, createdAt: t.createdAt,
    }));

    if (staleThreads.length === 0) {
      return NextResponse.json({
        staleThreads: [], suggestions: [],
        message: "放置スレッドはありません。フォーラムは活発です！",
      });
    }

    const threadSummaries = staleThreads.map(
      (t) => `「${t.title}」(${t.category}, ${t._count.comments}コメント, ${t._count.votes}票) by ${t.author.name}: ${t.content.slice(0, 150)}`
    );

    const prompt = `以下の放置されたフォーラムスレッド（X アルゴリズム学習コミュニティ）に対して、議論を活性化する一言コメントを提案してください。

## 放置スレッド
${threadSummaries.join("\n\n")}

JSON形式で回答:
{"suggestions": [{"threadId": "対象スレッドのタイトル", "comment": "提案するコメント（50-100文字）", "approach": "engagement/question/insight のいずれか"}]}`;

    const result = await callGemini(prompt, { temperature: 0.8 });

    if (!result.aiEnabled) {
      return NextResponse.json({
        staleThreads: threadData, suggestions: [],
        aiEnabled: false, message: result.message,
      });
    }

    const analysis = result.data as { suggestions?: { threadId: string; comment: string; approach: string }[] };

    return NextResponse.json({
      staleThreads: threadData,
      suggestions: analysis.suggestions || [],
      aiEnabled: true,
    });
  } catch (error) {
    console.error("Thread activator error:", error);
    return NextResponse.json({ error: "スレ活性化分析に失敗しました" }, { status: 500 });
  }
}
