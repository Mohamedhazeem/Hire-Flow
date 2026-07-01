export function PublicNavbarSkeleton() {
  return (
    <div className="sticky top-0 z-50 bg-bg-base border-b border-border-subtle">
      <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="h-5 w-24 bg-bg-muted rounded animate-pulse" />
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-full bg-bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  );
}
