import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

// SSRF Protection: Block private/reserved IP ranges
const BLOCKED_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^0\./,
  /^169\.254\./,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
  /^fd/i,
  /^localhost$/i,
];

function isBlockedHost(hostname: string): boolean {
  return BLOCKED_IP_PATTERNS.some((pattern) => pattern.test(hostname));
}

function validateUrl(urlStr: string): URL | null {
  try {
    const parsed = new URL(urlStr);
    // Only allow HTTPS
    if (parsed.protocol !== "https:") return null;
    // Block private IPs and localhost
    if (isBlockedHost(parsed.hostname)) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function fetchMetadata(url: string): Promise<{
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  favicon: string | null;
}> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "MatriXBot/1.0 (Link Preview)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    // Limit response size to 1MB
    const contentLength = res.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 1_000_000) {
      throw new Error("Response too large");
    }

    const html = await res.text();
    // Truncate if somehow larger
    const truncated = html.slice(0, 1_000_000);

    return parseMetaTags(truncated, url);
  } finally {
    clearTimeout(timeout);
  }
}

function parseMetaTags(
  html: string,
  baseUrl: string
): {
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  favicon: string | null;
} {
  const getMetaContent = (property: string): string | null => {
    // Match both property= and name= attributes
    const regex = new RegExp(
      `<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*?)["']|<meta[^>]*content=["']([^"']*?)["'][^>]*(?:property|name)=["']${property}["']`,
      "i"
    );
    const match = html.match(regex);
    return match ? (match[1] || match[2] || null) : null;
  };

  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const ogTitle = getMetaContent("og:title");
  const twitterTitle = getMetaContent("twitter:title");

  const ogDesc = getMetaContent("og:description");
  const twitterDesc = getMetaContent("twitter:description");
  const metaDesc = getMetaContent("description");

  const ogImage = getMetaContent("og:image");
  const twitterImage = getMetaContent("twitter:image");

  const ogSiteName = getMetaContent("og:site_name");

  // Favicon
  const faviconMatch = html.match(
    /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']*?)["']/i
  );
  let favicon = faviconMatch ? faviconMatch[1] : null;
  if (favicon && !favicon.startsWith("http")) {
    try {
      favicon = new URL(favicon, baseUrl).href;
    } catch {
      favicon = null;
    }
  }

  // Resolve relative image URLs
  let image = ogImage || twitterImage || null;
  if (image && !image.startsWith("http")) {
    try {
      image = new URL(image, baseUrl).href;
    } catch {
      image = null;
    }
  }

  return {
    title: ogTitle || twitterTitle || titleMatch?.[1]?.trim() || null,
    description: ogDesc || twitterDesc || metaDesc || null,
    image,
    siteName: ogSiteName || null,
    favicon,
  };
}

export async function GET(request: NextRequest) {
  // Rate limit: 30 req/min per IP
  const ip =
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const rl = checkRateLimit(`link-preview:${ip}`, 30, 60000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "url parameter required" }, { status: 400 });
  }

  // Validate URL (SSRF protection)
  const parsed = validateUrl(url);
  if (!parsed) {
    return NextResponse.json(
      { error: "Invalid or blocked URL. Only HTTPS URLs to public hosts are allowed." },
      { status: 400 }
    );
  }

  try {
    // Check cache first
    const cached = await prisma.linkPreviewCache.findUnique({
      where: { url },
    });

    if (cached && cached.expiresAt > new Date()) {
      return NextResponse.json({
        url: cached.url,
        title: cached.title,
        description: cached.description,
        image: cached.image,
        siteName: cached.siteName,
        favicon: cached.favicon,
        cached: true,
      });
    }

    // Fetch fresh metadata
    const metadata = await fetchMetadata(url);

    // Cache for 7 days
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.linkPreviewCache.upsert({
      where: { url },
      create: {
        url,
        ...metadata,
        expiresAt,
      },
      update: {
        ...metadata,
        fetchedAt: new Date(),
        expiresAt,
      },
    });

    return NextResponse.json({
      url,
      ...metadata,
      cached: false,
    });
  } catch (error) {
    console.error("Link preview fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch link preview" },
      { status: 502 }
    );
  }
}
