export function PublicNavbarSkeleton() {
  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-white/80 backdrop-blur-xl shadow-sm shadow-slate-900/5 dark:bg-slate-950/80 dark:shadow-none">
      <div className="mx-auto flex h-16 items-center gap-4 px-4 md:px-6 lg:px-8">
        <div className="inline-flex items-center gap-3 text-lg font-semibold text-text-heading transition hover:text-brand">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-brand/10 text-brand transition-transform duration-200 group-hover:scale-105">
            <div className="h-9 w-9 bg-bg-muted animate-pulse rounded-full" />
          </span>
          <div className="h-4 w-24 bg-bg-muted animate-pulse rounded" />
        </div>

        <nav className="hidden lg:flex items-center gap-2">
          <div className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-brand dark:text-slate-300 dark:hover:bg-slate-900">
            <div className="h-4 w-24 bg-bg-muted animate-pulse rounded" />
          </div>
          <div className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-brand dark:text-slate-300 dark:hover:bg-slate-900">
            <div className="h-4 w-20 bg-bg-muted animate-pulse rounded" />
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900">
              <div className="size-4 bg-bg-muted animate-pulse rounded-full" />
              <div className="h-4 w-10 bg-bg-muted animate-pulse rounded" />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand/20 transition hover:bg-brand-dark">
              <div className="size-4 bg-bg-muted animate-pulse rounded-full" />
              <div className="h-4 w-16 bg-bg-muted animate-pulse rounded" />
            </div>
          </div>

          <div className="size-9 bg-bg-muted animate-pulse rounded-full" />

          <button
            type="button"
            className="flex lg:hidden items-center justify-center rounded-full p-2 text-text-muted transition hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            <div className="size-5 bg-bg-muted animate-pulse rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
}