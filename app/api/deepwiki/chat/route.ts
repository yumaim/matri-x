import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { knowledgeBase, KnowledgeEntry } from "@/lib/knowledge/x-algorithm";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function normalizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[？?！!。、,\.「」『』（）\(\)]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 || /[a-zA-Z]/.test(t));
}

function scoreEntry(entry: KnowledgeEntry, tokens: string[]): number {
  let score = 0;
  const topicLower = entry.topic.toLowerCase();
  const keywordsLower = entry.keywords.map((k) => k.toLowerCase());
  const contentLower = entry.content.toLowerCase();

  for (const token of tokens) {
    if (topicLower === token) {
      score += 100;
    } else if (topicLower.includes(token)) {
      score += 50;
    }

    for (const keyword of keywordsLower) {
      if (keyword === token) {
        score += 30;
      } else if (keyword.includes(token) || token.includes(keyword)) {
        score += 15;
      }
    }

    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matches = (contentLower.match(new RegExp(escaped, "g")) || []).length;
    score += Math.min(matches * 3, 15);
  }

  return score;
}

function searchKnowledge(query: string, topN = 3): KnowledgeEntry[] {
  const tokens = normalizeQuery(query);
  if (tokens.length === 0) return [];

  return knowledgeBase
    .map((entry) => ({ entry, score: scoreEntry(entry, tokens) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map((r) => r.entry);
}

function generateRelatedQuestions(entries: KnowledgeEntry[]): string[] {
  const questions: string[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    if (entry.relatedTopics) {
      for (const topic of entry.relatedTopics) {
        if (!seen.has(topic)) {
          seen.add(topic);
          questions.push(`${topic}について詳しく教えてください`);
        }
      }
    }
  }

  return questions.slice(0, 3);
}

function formatResponse(query: string, entries: KnowledgeEntry[]) {
  if (entries.length === 0) {
    return {
      message: {
        role: "assistant" as const,
        content:
          "申し訳ありませんが、ご質問に関連する情報が見つかりませんでした。Xアルゴリズムに関する具体的なトピック（例：TweepCred、SimClusters、エンゲージメント重み付けなど）について質問してみてください。",
        sources: [],
        codeBlocks: [],
        relatedQuestions: [
          "パイプライン概要を教えてください",
          "TweepCredスコアはどのように計算されますか？",
          "エンゲージメント重み付けについて教えてください",
        ],
      },
    };
  }

  const primary = entries[0];
  let content = primary.content;

  // If there are additional matching entries, append summary
  if (entries.length > 1) {
    content += "\n\n---\n\n**関連情報:**\n";
    for (let i = 1; i < entries.length; i++) {
      const snippet = entries[i].content.split("\n").slice(0, 3).join("\n");
      content += `\n**${entries[i].topic}:**\n${snippet}\n`;
    }
  }

  const sources = entries.flatMap(
    (e) =>
      e.codeReferences?.map((ref) => ({
        title: ref.description,
        path: ref.file,
      })) ?? []
  );

  // Build code blocks from code references (show file paths as code references)
  const codeBlocks: { language: string; code: string; file: string }[] = [];
  for (const entry of entries) {
    if (entry.codeReferences && entry.codeReferences.length > 0) {
      const refLines = entry.codeReferences
        .map((ref) => `// ${ref.description}\n// File: ${ref.file}`)
        .join("\n\n");
      codeBlocks.push({
        language: "scala",
        code: refLines,
        file: `${entry.topic} - ソースコード参照`,
      });
    }
  }

  const relatedQuestions = generateRelatedQuestions(entries);

  return {
    message: {
      role: "assistant" as const,
      content,
      sources: sources.slice(0, 5),
      codeBlocks: codeBlocks.slice(0, 3),
      relatedQuestions,
    },
  };
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { messages } = await request.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }

    // Get the latest user message
    const userMessages = messages.filter((m: ChatMessage) => m.role === "user");
    const latestQuery = userMessages[userMessages.length - 1]?.content;
    if (!latestQuery) {
      return NextResponse.json({ error: "No user message found" }, { status: 400 });
    }

    const entries = searchKnowledge(latestQuery);
    const response = formatResponse(latestQuery, entries);

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
