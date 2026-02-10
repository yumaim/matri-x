export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 rounded-full border-4 border-muted animate-spin border-t-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">読み込み中...</p>
      </div>
    </div>
  );
}
