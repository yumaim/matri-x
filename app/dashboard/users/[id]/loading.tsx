export default function UserProfileLoading() {
  return (
    <div className="overflow-x-hidden">
      <div className="h-32 sm:h-44 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/10" />
      <div className="p-4 sm:p-6 lg:p-8 -mt-16 sm:-mt-20 space-y-6">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-muted animate-pulse shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-7 w-48 rounded bg-muted animate-pulse" />
            <div className="h-4 w-24 rounded bg-muted animate-pulse" />
            <div className="h-12 w-full max-w-md rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
        <div className="h-10 w-full rounded bg-muted animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
