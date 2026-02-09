import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { knowledgeBase, KnowledgeEntry } from "@/lib/knowledge/x-algorithm";

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
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { query } = await request.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    const tokens = normalizeQuery(query);
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
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
