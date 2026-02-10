"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4 text-center max-w-md px-4">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">
          エラーが発生しました
        </h2>
        <p className="text-sm text-muted-foreground">
          ページの読み込み中にエラーが発生しました。もう一度お試しください。
        </p>
        <Button onClick={reset} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          再読み込み
        </Button>
      </div>
    </div>
  );
}
