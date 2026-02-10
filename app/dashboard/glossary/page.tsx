"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  ExternalLink,
  Tag,
  Filter,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  glossaryTerms,
  GLOSSARY_CATEGORIES,
  type GlossaryCategory,
  type GlossaryTerm,
} from "@/lib/glossary-data";

const CATEGORY_COLORS: Record<GlossaryCategory, string> = {
  パイプライン: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  スコアリング: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  エンゲージメント: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  フィルタリング: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  その他: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

function getAlphabetIndex(terms: GlossaryTerm[]): string[] {
  const letters = new Set<string>();
  for (const t of terms) {
    const first = t.nameEn[0]?.toUpperCase();
    if (first) letters.add(first);
  }
  return Array.from(letters).sort();
}

export default function GlossaryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    GlossaryCategory | "すべて"
  >("すべて");

  const filtered = useMemo(() => {
    let result = glossaryTerms;

    if (selectedCategory !== "すべて") {
      result = result.filter((t) => t.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.nameEn.toLowerCase().includes(q) ||
          t.nameJa.includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => a.nameEn.localeCompare(b.nameEn));
  }, [searchQuery, selectedCategory]);

  const alphabetIndex = useMemo(() => getAlphabetIndex(filtered), [filtered]);

  // Group by first letter
  const grouped = useMemo(() => {
    const map = new Map<string, GlossaryTerm[]>();
    for (const t of filtered) {
      const letter = t.nameEn[0]?.toUpperCase() ?? "#";
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(t);
    }
    return map;
  }, [filtered]);

  const scrollToLetter = (letter: string) => {
    const el = document.getElementById(`glossary-${letter}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 overflow-x-hidden">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">
          <span className="text-gradient">用語集</span>
        </h1>
        <p className="mt-1 text-muted-foreground">
          X(Twitter)アルゴリズムの主要コンポーネントと用語を解説
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="用語を検索（英語 / 日本語 / キーワード）..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-muted/30 border-border/50"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {GLOSSARY_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "flex items-center gap-2 rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap",
              selectedCategory === cat.id
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            {cat.id === "すべて" ? (
              <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            ) : (
              <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Alphabet Jump — Desktop */}
        <nav className="hidden lg:flex flex-col gap-1 sticky top-4 self-start pt-2">
          {alphabetIndex.map((letter) => (
            <button
              key={letter}
              onClick={() => scrollToLetter(letter)}
              className="flex h-7 w-7 items-center justify-center rounded text-xs font-bold text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors"
            >
              {letter}
            </button>
          ))}
        </nav>

        {/* Terms */}
        <div className="flex-1 min-w-0 space-y-8">
          {/* Alphabet Jump — Mobile */}
          <div className="lg:hidden flex flex-wrap gap-1">
            {alphabetIndex.map((letter) => (
              <button
                key={letter}
                onClick={() => scrollToLetter(letter)}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-muted/30 text-xs font-bold text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors"
              >
                {letter}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>
              {filtered.length} 件
              {selectedCategory !== "すべて" && (
                <> — {selectedCategory}</>
              )}
              {searchQuery && (
                <> — 「{searchQuery}」で検索</>
              )}
            </span>
          </div>

          {filtered.length === 0 ? (
            <Card className="glass">
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  条件に一致する用語が見つかりませんでした
                </p>
              </CardContent>
            </Card>
          ) : (
            Array.from(grouped.entries()).map(([letter, terms]) => (
              <div key={letter} id={`glossary-${letter}`}>
                {/* Letter Header */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-lg">
                    {letter}
                  </span>
                  <div className="flex-1 h-px bg-border/50" />
                </div>

                {/* Cards */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {terms.map((term) => (
                    <Card
                      key={term.id}
                      className="glass group hover:border-primary/30 transition-colors"
                    >
                      <CardContent className="p-4 sm:p-5">
                        {/* Title Row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-foreground text-sm sm:text-base leading-snug">
                              {term.nameEn}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {term.nameJa}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "shrink-0 text-[10px] font-medium",
                              CATEGORY_COLORS[term.category]
                            )}
                          >
                            {term.category}
                          </Badge>
                        </div>

                        {/* Description */}
                        <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                          {term.description}
                        </p>

                        {/* Related Link */}
                        {term.relatedLink && (
                          <Link
                            href={term.relatedLink.href}
                            className="inline-flex items-center gap-1.5 mt-3 text-xs text-primary hover:underline transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {term.relatedLink.label}
                          </Link>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
