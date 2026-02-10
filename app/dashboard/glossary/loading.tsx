import { Card, CardContent } from "@/components/ui/card";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

export default function GlossaryLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>

      {/* Search Bar */}
      <Skeleton className="h-10 w-full max-w-xl" />

      {/* Category Filter */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>

      {/* Alphabet */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="h-8 w-8 rounded-md" />
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-8">
        {[1, 2, 3].map((section) => (
          <div key={section}>
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="flex-1 h-px bg-border/50" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[1, 2].map((card) => (
                <Card key={card}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
