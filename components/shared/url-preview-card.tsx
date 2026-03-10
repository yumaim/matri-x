"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Globe, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LinkPreviewData } from "@/lib/url-utils";
import { isXPostUrl } from "@/lib/url-utils";

interface UrlPreviewCardProps {
  url: string;
  compact?: boolean;
}

export function UrlPreviewCard({ url, compact = false }: UrlPreviewCardProps) {
  const [data, setData] = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((preview) => {
        if (!cancelled) {
          setData(preview);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  const isX = isXPostUrl(url);

  if (loading) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border border-border/30 bg-card/30 p-3 animate-pulse",
          compact ? "p-2" : "p-3"
        )}
      >
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="h-3 w-3/4 rounded bg-muted/40" />
          <div className="h-2.5 w-1/2 rounded bg-muted/30" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-lg border border-border/30 bg-card/30 p-2.5 text-xs text-muted-foreground hover:border-primary/30 hover:text-primary transition-all group"
      >
        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate group-hover:underline">{url}</span>
      </a>
    );
  }

  // X post special styling
  if (isX) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block rounded-xl border border-zinc-700/50 bg-zinc-900/80 overflow-hidden transition-all hover:border-zinc-600/60 hover:shadow-lg hover:shadow-black/20"
      >
        <div className="p-3 sm:p-4">
          {/* X logo header */}
          <div className="flex items-center gap-2 mb-2">
            <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span className="text-xs text-zinc-400">{data.siteName || "X"}</span>
          </div>
          {data.title && (
            <p className="text-sm text-zinc-200 leading-relaxed line-clamp-3">
              {data.title}
            </p>
          )}
          {data.description && !data.title && (
            <p className="text-sm text-zinc-200 leading-relaxed line-clamp-3">
              {data.description}
            </p>
          )}
        </div>
        {data.image && (
          <div className="border-t border-zinc-700/40">
            <img
              src={data.image}
              alt=""
              className="w-full h-auto max-h-[200px] object-cover"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
      </a>
    );
  }

  // Standard link preview card
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group block rounded-xl border border-border/30 bg-card/40 overflow-hidden transition-all hover:border-primary/30 hover:bg-card/60 hover:shadow-md",
        compact && "rounded-lg"
      )}
    >
      <div className="flex">
        {/* Text content */}
        <div
          className={cn(
            "flex-1 min-w-0 p-3",
            compact ? "p-2.5" : "p-3 sm:p-4"
          )}
        >
          {/* Site name + favicon */}
          <div className="flex items-center gap-1.5 mb-1">
            {data.favicon ? (
              <img
                src={data.favicon}
                alt=""
                className="h-3.5 w-3.5 rounded-sm shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <Globe className="h-3 w-3 text-muted-foreground shrink-0" />
            )}
            <span className="text-[10px] text-muted-foreground truncate">
              {data.siteName || new URL(url).hostname}
            </span>
          </div>

          {/* Title */}
          {data.title && (
            <h4
              className={cn(
                "font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2",
                compact ? "text-xs" : "text-sm"
              )}
            >
              {data.title}
            </h4>
          )}

          {/* Description */}
          {data.description && (
            <p
              className={cn(
                "mt-0.5 text-muted-foreground line-clamp-2",
                compact ? "text-[10px]" : "text-xs"
              )}
            >
              {data.description}
            </p>
          )}
        </div>

        {/* Image */}
        {data.image && (
          <div
            className={cn(
              "shrink-0 border-l border-border/20",
              compact ? "w-20 h-20" : "w-28 h-28 sm:w-32 sm:h-32"
            )}
          >
            <img
              src={data.image}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).parentElement!.style.display =
                  "none";
              }}
            />
          </div>
        )}
      </div>
    </a>
  );
}

/** Renders URL preview cards for all URLs found in text */
export function UrlPreviews({
  urls,
  compact = false,
}: {
  urls: string[];
  compact?: boolean;
}) {
  if (urls.length === 0) return null;

  return (
    <div className="space-y-2 mt-2">
      {urls.map((url) => (
        <UrlPreviewCard key={url} url={url} compact={compact} />
      ))}
    </div>
  );
}
