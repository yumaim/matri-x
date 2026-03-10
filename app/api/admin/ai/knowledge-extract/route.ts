import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { callGemini } from "@/lib/gemini";

export const runtime = "nodejs";

/**
 * AI Knowledge Extraction API (Gemini)
 * Identifies high-quality threads and generates FAQ/knowledge summaries.
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "MODERATOR"].includes((session.user as { role?: string }).role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const topThreads = await prisma.forumPost.findMany({
      where: {
        status: "PUBLISHED",
        OR: [{ isVerified: true }, { viewCount: { gte: 10 } }],
      },
      include: {
        author: { select: { name: true } },
        comments: {
          select: { content: true, author: { select: { name: true } } },
          take: 10, orderBy: { createdAt: "asc" },
        },
        _count: { select: { comments: true, votes: true } },
      },
      orderBy: { viewCount: "desc" },
      take: 15,
    });

    const threadList = topThreads.map((t) => ({
      id: t.id, title: t.title, category: t.category,
      voteCount: t._count.votes, isVerified: t.isVerified,
      commentCount: t._count.comments,
    }));

    if (topThreads.length === 0) {
      return NextResponse.json({
        topThreads: [], knowledgeItems: [],
        message: "高評価スレッドがまだありません。",
      });
    }

    const threadContexts = topThreads.slice(0, 8).map((t) => {
      const commentTexts = t.comments.map((c) => `${c.author.name}: ${c.content.slice(0, 100)}`);
      return `## ${t.title} [${t.category}] (${t._count.votes}票, ${t.isVerified ? "検証済み" : "未検証"})
${t.content.slice(0, 400)}
${commentTexts.length > 0 ? "\nコメント:\n" + commentTexts.join("\n") : ""}`;
    });

    const prompt = `以下の高評価フォーラムスレッド（X アルゴリズム学習コミュニティ）を分析し、FAQ/ナレッジベースに整理してください。

${threadContexts.join("\n\n---\n\n")}

JSON形式で回答:
{"knowledgeItems": [{"title": "FAQ/ナレッジのタイトル", "summary": "要約（100-200文字）", "category": "元カテゴリ", "sourceThreadIds": ["スレッドタイトル"], "importance": "high/medium/low"}]}`;

    const result = await callGemini(prompt, { temperature: 0.5 });

    if (!result.aiEnabled) {
      return NextResponse.json({
        topThreads: threadList, knowledgeItems: [],
        aiEnabled: false, message: result.message,
      });
    }

    const analysis = result.data as { knowledgeItems?: { title: string; summary: string; category: string; importance: string }[] };

    return NextResponse.json({
      topThreads: threadList,
      knowledgeItems: analysis.knowledgeItems || [],
      aiEnabled: true,
    });
  } catch (error) {
    console.error("AI knowledge extraction error:", error);
    return NextResponse.json({ error: "ナレッジ抽出に失敗しました" }, { status: 500 });
  }
}
