"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ApplicantDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="size-8 rounded-md" />
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-48 rounded-md" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>
      </div>
      <Skeleton className="h-5 w-28 rounded-md" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>

      <Skeleton className="h-16 rounded-2xl" />
    </div>
  );
}
