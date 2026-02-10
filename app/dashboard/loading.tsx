export default function DashboardLoading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-muted animate-spin border-t-primary" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">読み込み中...</p>
      </div>
    </div>
  );
}
