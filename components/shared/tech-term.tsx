"use client";

import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TechTermProps {
  term: string;
  definition: string;
  example?: string;
}

export function TechTerm({ term, definition, example }: TechTermProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 cursor-help border-b border-dotted border-primary/50 text-primary">
            {term}
            <HelpCircle className="h-3 w-3 opacity-60" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs p-3">
          <div className="space-y-1.5">
            <p className="font-medium text-sm">{definition}</p>
            {example && (
              <p className="text-xs text-muted-foreground">
                💡 例: {example}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
