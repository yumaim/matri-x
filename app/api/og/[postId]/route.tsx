import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const CATEGORY_LABELS: Record<string, string> = {
  ALGORITHM: "アルゴリズム解説",
  VERIFICATION: "現場検証",
  HEAVY_RANKER: "Heavy Ranker",
  SIMCLUSTERS: "SimClusters",
  TWEEPCRED: "TweepCred",
  STRATEGY: "戦略・Tips",
  UPDATES: "最新アップデート",
  QUESTIONS: "質問・相談",
};

const CATEGORY_COLORS: Record<string, string> = {
  ALGORITHM: "#3b82f6",
  VERIFICATION: "#a855f7",
  HEAVY_RANKER: "#06b6d4",
  SIMCLUSTERS: "#6366f1",
  TWEEPCRED: "#ec4899",
  STRATEGY: "#10b981",
  UPDATES: "#f97316",
  QUESTIONS: "#eab308",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  // Rate limit: 60 requests per minute per IP
  const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = checkRateLimit(`og:${ip}`, 60, 60000);
  if (!rl.allowed) {
    return new Response("Too Many Requests", { status: 429 });
  }

  const { postId } = await params;

  const post = await prisma.forumPost.findUnique({
    where: { id: postId },
    include: {
      author: { select: { name: true } },
      _count: { select: { comments: true, votes: true } },
    },
  });

  if (!post || post.status !== "PUBLISHED") {
    return new Response("Not found", { status: 404 });
  }

  const categoryLabel = CATEGORY_LABELS[post.category] ?? post.category;
  const categoryColor = CATEGORY_COLORS[post.category] ?? "#6366f1";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200",
          height: "630",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
          padding: "60px",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${categoryColor}20 0%, transparent 70%)`,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-50px",
            left: "-50px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, #6366f120 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Header: Logo + Category */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "40px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            >
              M
            </div>
            <span style={{ color: "#a1a1aa", fontSize: "24px", fontWeight: "600" }}>
              matri-x
            </span>
          </div>
          <div
            style={{
              display: "flex",
              marginLeft: "auto",
              padding: "8px 20px",
              borderRadius: "999px",
              background: `${categoryColor}20`,
              border: `1px solid ${categoryColor}40`,
              color: categoryColor,
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            {categoryLabel}
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h1
            style={{
              fontSize: post.title.length > 40 ? "42px" : "52px",
              fontWeight: "800",
              color: "#fafafa",
              lineHeight: 1.3,
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              overflow: "hidden",
            }}
          >
            {post.title}
          </h1>
        </div>

        {/* Footer: Author + Stats */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: `${categoryColor}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: categoryColor,
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              {(post.author.name ?? "?")[0].toUpperCase()}
            </div>
            <span style={{ color: "#a1a1aa", fontSize: "20px" }}>
              {post.author.name ?? "匿名"}
            </span>
          </div>

          <div style={{ display: "flex", gap: "24px" }}>
            <span style={{ color: "#71717a", fontSize: "18px", display: "flex", alignItems: "center", gap: "6px" }}>
              💬 {post._count.comments}
            </span>
            <span style={{ color: "#71717a", fontSize: "18px", display: "flex", alignItems: "center", gap: "6px" }}>
              👍 {post._count.votes}
            </span>
            <span style={{ color: "#71717a", fontSize: "18px", display: "flex", alignItems: "center", gap: "6px" }}>
              👁️ {post.viewCount}
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
