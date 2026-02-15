"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface GlossaryTerm {
  term: string;
  definition: string;
  example?: string;
  category?: string;
}

interface GlossarySectionProps {
  terms: GlossaryTerm[];
  title?: string;
  description?: string;
  defaultOpen?: boolean;
}

export function GlossarySection({
  terms,
  title = "📖 用語ガイド",
  description = "このページで使われる専門用語を分かりやすく解説します",
  defaultOpen = false,
}: GlossarySectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // カテゴリごとにグループ化
  const groupedTerms = terms.reduce((acc, term) => {
    const category = term.category || "その他";
    if (!acc[category]) acc[category] = [];
    acc[category].push(term);
    return acc;
  }, {} as Record<string, GlossaryTerm[]>);

  const categories = Object.keys(groupedTerms);

  return (
    <Card className="glass border-border/30 overflow-hidden mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-4 sm:px-6 py-4 border-b border-border/30 hover:from-blue-500/15 hover:to-purple-500/15 transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 border border-blue-500/30 shrink-0">
              <BookOpen className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm sm:text-base">{title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {isOpen ? "閉じる" : "開く"}
            </span>
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </button>

      {isOpen && (
        <CardContent className="p-4 sm:p-6">
          {categories.length === 1 ? (
            <div className="grid gap-3 sm:gap-4">
              {terms.map((item, idx) => (
                <TermCard key={idx} term={item} />
              ))}
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {categories.map((category) => (
                <AccordionItem key={category} value={category} className="border-border/30">
                  <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
                    {category} ({groupedTerms[category].length}個)
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <div className="grid gap-3">
                      {groupedTerms[category].map((item, idx) => (
                        <TermCard key={idx} term={item} />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function TermCard({ term }: { term: GlossaryTerm }) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/30 p-3 sm:p-4 hover:border-primary/30 hover:bg-card/50 transition-all">
      <div className="flex items-start gap-2 mb-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
          <span className="text-xs font-bold">?</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-foreground">{term.term}</h4>
        </div>
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-2">
        {term.definition}
      </p>
      {term.example && (
        <div className="mt-3 pt-3 border-t border-border/30">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] sm:text-xs text-muted-foreground/80 italic leading-relaxed">
                {term.example}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
