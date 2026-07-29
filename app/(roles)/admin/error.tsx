"use client";

import ErrorPage from "@/components/shared/error-page";

export default function AdminErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="space-y-4">
      <ErrorPage
        errorTag="ADMIN_ERROR"
        title="Dashboard Error"
        description="Something went wrong loading the admin dashboard. Please try again."
      />
      <div className="flex justify-center">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/80 h-9 px-4 text-sm font-medium transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
