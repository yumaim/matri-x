import { NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/api-helpers";
import { knowledgeBase, KnowledgeEntry } from "@/lib/knowledge/x-algorithm";
import { z } from "zod";

const searchSchema = z.object({
  query: z.string().min(1, "検索キーワードを入力してください").max(200),
});

interface SearchResult {
  entry: KnowledgeEntry;
  score: number;
}

function normalizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[？?！!。、,\.]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 0);
}

function scoreEntry(entry: KnowledgeEntry, tokens: string[]): number {
  let score = 0;
  const topicLower = entry.topic.toLowerCase();
  const keywordsLower = entry.keywords.map((k) => k.toLowerCase());
  const contentLower = entry.content.toLowerCase();

  for (const token of tokens) {
    // Topic exact match (highest priority)
    if (topicLower === token) {
      score += 100;
    } else if (topicLower.includes(token)) {
      score += 50;
    }

    // Keyword match
    for (const keyword of keywordsLower) {
      if (keyword === token) {
        score += 30;
      } else if (keyword.includes(token) || token.includes(keyword)) {
        score += 15;
      }
    }

    // Content match (lowest priority)
    const contentMatches = (contentLower.match(new RegExp(escapeRegExp(token), "g")) || []).length;
    score += Math.min(contentMatches * 3, 15);
  }

  return score;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function POST(request: Request) {
  try {
    await requireAuth();

    const body = await request.json();
    const parsed = searchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const tokens = normalizeQuery(parsed.data.query);
    if (tokens.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const scored: SearchResult[] = knowledgeBase
      .map((entry) => ({ entry, score: scoreEntry(entry, tokens) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return NextResponse.json({
      results: scored.map((r) => ({
        id: r.entry.id,
        topic: r.entry.topic,
        category: r.entry.category,
        score: r.score,
        snippet: r.entry.content.slice(0, 200) + (r.entry.content.length > 200 ? "..." : ""),
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
