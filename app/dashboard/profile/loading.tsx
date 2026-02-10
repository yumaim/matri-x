function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

export default function ProfileLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-2xl">
      <Skeleton className="h-8 w-48" />
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}
