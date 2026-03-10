/**
 * URL Extraction & Detection Utilities
 * Shared between Forum posts and Whispers
 */

/** Maximum number of URLs to preview per post */
export const MAX_PREVIEW_URLS = 3;

/** Extract URLs from text content */
export function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"')\]]+/gi;
  const matches = text.match(urlRegex);
  if (!matches) return [];

  // Deduplicate and limit
  const unique = [...new Set(matches)];
  return unique.slice(0, MAX_PREVIEW_URLS);
}

/** Check if a URL is an X (Twitter) post URL */
export function isXPostUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "");
    if (host !== "x.com" && host !== "twitter.com") return false;
    // Match /{username}/status/{id}
    return /^\/[^/]+\/status\/\d+/.test(parsed.pathname);
  } catch {
    return false;
  }
}

/** Extract X post ID from URL */
export function extractXPostId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/\/status\/(\d+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/** Check if a URL is from a known safe domain for embedding */
export function isEmbeddableDomain(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "");
    const embeddable = [
      "x.com",
      "twitter.com",
      "youtube.com",
      "youtu.be",
      "github.com",
      "note.com",
      "zenn.dev",
      "qiita.com",
    ];
    return embeddable.includes(host);
  } catch {
    return false;
  }
}

export interface LinkPreviewData {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  favicon: string | null;
}
