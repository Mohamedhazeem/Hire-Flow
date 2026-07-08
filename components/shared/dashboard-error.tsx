import { ActivityIcon } from "lucide-react";

export function DashboardError() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="size-12 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-3">
          <ActivityIcon className="size-6 text-error" />
        </div>
        <p className="text-destructive text-sm font-medium">Failed to load dashboard data</p>
        <p className="text-text-muted text-xs mt-1">Please try refreshing the page</p>
      </div>
    </div>
  );
}
