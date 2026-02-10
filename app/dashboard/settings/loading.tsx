function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

export default function SettingsLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-2xl">
      <Skeleton className="h-8 w-32" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
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
