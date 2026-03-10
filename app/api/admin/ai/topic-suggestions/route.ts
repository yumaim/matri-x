import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { callGemini } from "@/lib/gemini";

export const runtime = "nodejs";

/**
 * AI Topic Suggestions API (Gemini)
 * Analyzes recent forum activity and suggests trending topics.
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "MODERATOR"].includes((session.user as { role?: string }).role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const recentPosts = await prisma.forumPost.findMany({
      where: { createdAt: { gte: sevenDaysAgo }, status: "PUBLISHED" },
      include: {
        _count: { select: { comments: true, votes: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const recentComments = await prisma.comment.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { content: true },
      take: 100,
      orderBy: { createdAt: "desc" },
    });

    const unansweredQuestions = await prisma.forumPost.findMany({
      where: {
        category: "QUESTIONS", status: "PUBLISHED",
        createdAt: { gte: sevenDaysAgo },
        comments: { none: {} },
      },
      select: { id: true, title: true },
      take: 10,
    });

    const baseStats = {
      postsLast7Days: recentPosts.length,
      unansweredQuestions: unansweredQuestions.length,
      topCategories: getTopCategories(recentPosts),
    };

    const postSummaries = recentPosts.map(
      (p) => `[${p.category}] ${p.title} (votes:${p._count.votes}, comments:${p._count.comments})`
    );
    const commentSnippets = recentComments.map((c) => c.content.slice(0, 100));

    const prompt = `あなたはX（Twitter）アルゴリズムの学習コミュニティのフォーラム管理者AIです。
以下の直近7日間の投稿データを分析し、日本語で回答してください。

## 最近の投稿 (${recentPosts.length}件)
${postSummaries.join("\n")}

## コメントサンプル
${commentSnippets.slice(0, 20).join("\n")}

## 未回答質問 (${unansweredQuestions.length}件)
${unansweredQuestions.map((q) => q.title).join("\n")}

以下のJSON形式で回答:
{
  "trendingTopics": ["今話題のテーマ1", "テーマ2", "テーマ3"],
  "suggestedPosts": [
    {"title": "推奨投稿タイトル", "category": "ALGORITHM", "reason": "理由", "template": "テンプレート冒頭"}
  ],
  "communityInsights": "コミュニティの現状分析（2-3文）",
  "actionItems": ["管理者への推奨アクション1", "アクション2"]
}`;

    const result = await callGemini(prompt, { temperature: 0.7 });

    if (!result.aiEnabled) {
      return NextResponse.json({
        suggestions: [], stats: baseStats,
        unansweredQuestions: unansweredQuestions.map((q) => ({ id: q.id, title: q.title })),
        aiEnabled: false, message: result.message,
      });
    }

    const analysis = result.data as {
      trendingTopics?: string[]; suggestedPosts?: TopicSuggestion[];
      communityInsights?: string; actionItems?: string[];
    };

    return NextResponse.json({
      suggestions: analysis.suggestedPosts || [],
      trendingTopics: analysis.trendingTopics || [],
      communityInsights: analysis.communityInsights || "",
      actionItems: analysis.actionItems || [],
      stats: baseStats,
      unansweredQuestions: unansweredQuestions.map((q) => ({ id: q.id, title: q.title })),
      aiEnabled: true,
    });
  } catch (error) {
    console.error("AI topic suggestions error:", error);
    return NextResponse.json({ error: "AI分析に失敗しました" }, { status: 500 });
  }
}

interface TopicSuggestion { title: string; category: string; reason: string; template?: string }

function getTopCategories(posts: { category: string }[]): { category: string; count: number }[] {
  const counts: Record<string, number> = {};
  posts.forEach((p) => { counts[p.category] = (counts[p.category] || 0) + 1; });
  return Object.entries(counts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}
