"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import WhisperCard from "@/components/whispers/whisper-card";
import WhisperCompose from "@/components/whispers/whisper-compose";
import { Loader2, Wind, Sparkles, TrendingUp, Users } from "lucide-react";

interface WhisperAuthor {
  id: string;
  name: string | null;
  image: string | null;
  role: string;
  xHandle: string | null;
}

interface Whisper {
  id: string;
  content: string;
  createdAt: string;
  author: WhisperAuthor;
  reactionCounts: Record<string, number>;
  userReactions: string[];
  totalReactions: number;
}

interface WhisperResponse {
  whispers: Whisper[];
  nextCursor: string | null;
}

export default function WhispersPage() {
  const [whispers, setWhispers] = useState<Whisper[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string | null; image: string | null } | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Fetch user info
  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setUser({ name: d.name, image: d.image });
      })
      .catch(() => {});
  }, []);

  // Fetch whispers
  const fetchWhispers = useCallback(
    async (cursor?: string) => {
      try {
        const params = new URLSearchParams({ limit: "20" });
        if (cursor) params.set("cursor", cursor);

        const res = await fetch(`/api/whispers?${params}`);
        if (!res.ok) throw new Error("Failed to fetch");

        const data: WhisperResponse = await res.json();

        setWhispers((prev) =>
          cursor ? [...prev, ...data.whispers] : data.whispers
        );
        setNextCursor(data.nextCursor);
        setHasMore(data.nextCursor !== null);
      } catch {
        setError("囁きの取得に失敗しました");
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    setIsLoading(true);
    fetchWhispers().finally(() => setIsLoading(false));
  }, [fetchWhispers]);

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && nextCursor) {
          setIsLoadingMore(true);
          fetchWhispers(nextCursor).finally(() => setIsLoadingMore(false));
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore, isLoadingMore, nextCursor, fetchWhispers]);

  // Handle new whisper post
  const handlePost = async (content: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/whispers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "投稿に失敗しました");
        setTimeout(() => setError(null), 3000);
        return false;
      }

      const newWhisper: Whisper = await res.json();
      setWhispers((prev) => [newWhisper, ...prev]);
      return true;
    } catch {
      setError("投稿に失敗しました");
      setTimeout(() => setError(null), 3000);
      return false;
    }
  };

  // Handle reaction
  const handleReaction = async (whisperId: string, emoji: string) => {
    try {
      await fetch(`/api/whispers/${whisperId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
    } catch {
      // Reaction failed silently — optimistic UI handles display
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wind className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold">囁き</h1>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-muted-foreground/50" />
            <span className="text-xs text-muted-foreground/50">Timeline</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Compose */}
        <WhisperCompose user={user} onSubmit={handlePost} />

        {/* Error toast */}
        {error && (
          <div className="mx-4 mt-3 px-4 py-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        {/* Timeline */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">読み込み中...</p>
          </div>
        ) : whispers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-8">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-float">
              <Wind className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">まだ囁きがありません</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                最初の囁きを投稿して、
                <br />
                タイムラインを始めましょう！
              </p>
            </div>
          </div>
        ) : (
          <>
            <div>
              {whispers.map((whisper, index) => (
                <div
                  key={whisper.id}
                  style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
                  className="animate-in fade-in slide-in-from-bottom-2"
                >
                  <WhisperCard whisper={whisper} onReaction={handleReaction} />
                </div>
              ))}
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="py-8">
              {isLoadingMore && (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">もっと読み込み中...</span>
                </div>
              )}
              {!hasMore && whispers.length > 0 && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground/50">
                    すべての囁きを読みました ✨
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right sidebar hint (desktop only) */}
      <div className="fixed right-8 top-24 hidden xl:block w-72">
        <div className="glass rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            囁きについて
          </h3>
          <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
            <p>
              フォーラムとは異なり、気軽な一言を共有する場です。
              実践で得た気づき、トレンドの変化、小さな成功体験を仲間と共有しましょう。
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Users className="h-3.5 w-3.5" />
              <span>1日5回まで投稿可能</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">🔥👏💡🎯</span>
              <span>リアクションで応える</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
