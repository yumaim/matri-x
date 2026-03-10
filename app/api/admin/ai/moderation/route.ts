import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { callGemini } from "@/lib/gemini";

export const runtime = "nodejs";

/**
 * AI Moderation API (Gemini)
 * Scores posts for spam, harassment, and low quality.
 * Results are a priority review queue (not auto-deletions).
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "MODERATOR"].includes((session.user as { role?: string }).role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    const recentPosts = await prisma.forumPost.findMany({
      where: { createdAt: { gte: twoDaysAgo }, status: "PUBLISHED" },
      include: {
        author: { select: { id: true, name: true, role: true } },
        _count: { select: { comments: true, votes: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    const recentComments = await prisma.comment.findMany({
      where: { createdAt: { gte: twoDaysAgo } },
      include: {
        author: { select: { id: true, name: true, role: true } },
        post: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const contentItems = [
      ...recentPosts.map((p) => ({
        type: "post" as const, id: p.id, title: p.title,
        text: p.content.slice(0, 300), author: p.author.name,
      })),
      ...recentComments.map((c) => ({
        type: "comment" as const, id: c.id, title: `Re: ${c.post.title}`,
        text: c.content.slice(0, 200), author: c.author.name,
      })),
    ];

    if (contentItems.length === 0) {
      return NextResponse.json({
        flagged: [], totalAnalyzed: 0, aiEnabled: true,
        message: "レビュー対象のコンテンツがありません。",
      });
    }

    const prompt = `以下のフォーラム投稿・コメントをモデレーション観点でレビューしてください。
これはX（Twitter）アルゴリズム学習コミュニティです。

各コンテンツについて、以下のスコアを0-10で付けてください:
- spam: スパム度合い
- toxicity: 有害性
- quality: コンテンツ品質（0=最低, 10=最高）

## コンテンツ一覧
${contentItems.map((item, i) => `${i}. [${item.type}] ${item.title}: ${item.text}`).join("\n")}

JSON形式で回答。flagged のみ返してください（spam>5 OR toxicity>5 OR quality<3）:
{"flagged": [{"index": 0, "type": "post", "id": "...", "spam": 8, "toxicity": 2, "quality": 3, "reason": "理由"}]}`;

    const result = await callGemini(prompt, { temperature: 0.3 });

    if (!result.aiEnabled) {
      return NextResponse.json({
        flagged: [], totalAnalyzed: 0,
        aiEnabled: false, message: result.message,
      });
    }

    const analysis = result.data as { flagged?: { index: number; type: string; id: string; spam: number; toxicity: number; quality: number; reason: string }[] };

    const flagged = (analysis.flagged || []).map((item) => {
      const original = contentItems[item.index];
      return { ...item, title: original?.title, text: original?.text, author: original?.author };
    });

    return NextResponse.json({
      flagged, totalAnalyzed: contentItems.length, aiEnabled: true,
    });
  } catch (error) {
    console.error("AI moderation error:", error);
    return NextResponse.json({ error: "AI モデレーション分析に失敗しました" }, { status: 500 });
  }
}
