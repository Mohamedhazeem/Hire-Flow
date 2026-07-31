import { Skeleton } from "@/components/ui/skeleton";

export function LandingPageSkeleton() {
  return (
    <>
      <section className="relative min-h-screen sm:min-h-[85vh] flex items-center justify-center overflow-hidden py-16 sm:py-0">
        <div className="absolute inset-0 bg-neutral-800" />
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center">
          <Skeleton className="h-4 w-48 mx-auto mb-6 rounded-full" />
          <Skeleton className="h-12 w-full max-w-2xl mx-auto mb-4 rounded-lg" />
          <Skeleton className="h-6 w-full max-w-xl mx-auto mb-8 rounded-md" />
          <Skeleton className="h-12 w-full max-w-md mx-auto rounded-xl" />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <Skeleton className="h-11 w-40 rounded-xl" />
            <Skeleton className="h-11 w-40 rounded-xl" />
          </div>
        </div>
      </section>

      <div className="bg-bg-surface border-b border-border-subtle">
        <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-6 sm:py-8">
          <Skeleton className="h-5 w-40 mb-4 rounded-md" />
          <div className="flex gap-3 overflow-x-auto pb-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-28 rounded-2xl shrink-0" />
            ))}
          </div>
        </div>
      </div>

      <section className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Skeleton className="h-8 w-48 rounded-lg" />
              <Skeleton className="h-4 w-64 mt-1 rounded-md" />
            </div>
            <Skeleton className="h-5 w-24 rounded-md hidden sm:inline" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-56 rounded-lg" />
            <Skeleton className="h-4 w-48 mt-1 rounded-md" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-bg-surface border-y border-border-subtle py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <Skeleton className="h-8 w-64 mx-auto mb-2 rounded-lg" />
          <Skeleton className="h-4 w-80 mx-auto mb-10 rounded-md" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-bg-page border border-border-subtle rounded-2xl p-6 sm:p-8"
              >
                <Skeleton className="h-12 w-12 rounded-xl mx-auto mb-4" />
                <Skeleton className="h-4 w-20 mx-auto mb-2 rounded-md" />
                <Skeleton className="h-6 w-40 mx-auto mb-3 rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md mt-2" />
                <Skeleton className="h-10 w-full rounded-md mt-2" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <Skeleton className="h-8 w-8 mx-auto mb-4 rounded-full" />
          <Skeleton className="h-8 w-56 mx-auto mb-8 rounded-lg" />
          <Skeleton className="h-20 w-full max-w-xl mx-auto rounded-lg" />
          <Skeleton className="h-12 w-12 rounded-full mx-auto mt-6" />
        </div>
      </section>

      <section className="bg-neutral-900 dark:bg-neutral-950 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <Skeleton className="h-9 w-80 mx-auto mb-4 rounded-lg" />
          <Skeleton className="h-5 w-96 mx-auto mb-8 rounded-md" />
          <Skeleton className="h-12 w-40 mx-auto rounded-xl" />
        </div>
      </section>
    </>
  );
}
