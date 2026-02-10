function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

export default function DeepWikiLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
      <div className="space-y-2 mb-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
          <Skeleton className="h-5 w-64 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
      <Skeleton className="h-12 w-full" />
    </div>
  );
}
