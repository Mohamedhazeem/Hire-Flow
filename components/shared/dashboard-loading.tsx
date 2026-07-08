export function DashboardLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        <p className="text-text-muted text-sm">Loading dashboard...</p>
      </div>
    </div>
  );
}
