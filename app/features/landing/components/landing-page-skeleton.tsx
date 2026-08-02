import { Skeleton } from "@/components/ui/skeleton";

export function LandingPageSkeleton() {
  return (
    <>
      <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-950 min-h-[85vh] py-12 sm:py-16">
        <div className="absolute inset-0 bg-hero-hex-grid opacity-20 dark:opacity-15" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.14),transparent_28%),radial-gradient(circle_at_80%_15%,rgba(16,185,129,0.1),transparent_28%),radial-gradient(circle_at_50%_75%,rgba(236,72,153,0.12),transparent_28%)]" />
        <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] items-center">
            <div className="space-y-6">
              <Skeleton className="h-6 w-44 rounded-full" />
              <Skeleton className="h-14 w-full max-w-3xl rounded-[1.5rem]" />
              <Skeleton className="h-5 w-full max-w-2xl rounded-md" />
              <div className="flex flex-col sm:flex-row gap-3">
                <Skeleton className="h-12 w-full sm:w-40 rounded-2xl" />
                <Skeleton className="h-12 w-full sm:w-40 rounded-2xl" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-24 rounded-[1.75rem]" />
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.18)] dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)]">
              <Skeleton className="h-6 w-40 rounded-full mb-6" />
              <Skeleton className="h-12 w-full rounded-[1.75rem] mb-4" />
              <Skeleton className="h-12 w-full rounded-[1.75rem]" />
            </div>
          </div>
        </div>
      </section>

      <section className="text-slate-950 dark:text-white border-t border-slate-200 dark:border-slate-800 py-12 sm:py-16">
        <div className="relative max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
          <Skeleton className="h-5 w-48 rounded-full mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-36 rounded-3xl" />
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 text-slate-950 dark:text-white">
        <div className="relative max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 rounded-full mb-3" />
            <Skeleton className="h-4 w-80 rounded-md" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-52 rounded-[2rem]" />
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 text-slate-950 dark:text-white">
        <div className="relative max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <Skeleton className="h-8 w-72 mx-auto rounded-full mb-3" />
            <Skeleton className="h-4 w-60 mx-auto rounded-md" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-44 rounded-[2rem]" />
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 text-slate-950 dark:text-white">
        <div className="relative max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <Skeleton className="h-8 w-72 mx-auto rounded-full mb-3" />
            <Skeleton className="h-4 w-72 mx-auto rounded-md" />
          </div>
          <Skeleton className="h-72 rounded-[2rem] mx-auto max-w-4xl" />
          <div className="mt-8 flex items-center justify-center gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-2.5 w-10 rounded-full" />
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 text-slate-950 dark:text-white">
        <div className="relative max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
          <Skeleton className="h-10 w-72 mx-auto rounded-full mb-4" />
          <Skeleton className="h-5 w-80 mx-auto rounded-md mb-6" />
          <Skeleton className="h-14 w-full max-w-xs mx-auto rounded-[1.5rem]" />
        </div>
      </section>
    </>
  );
}
