import { Suspense } from "react";
import { ApplicationsPage } from "@/app/features/user/components/applications-page";

export const metadata = {
  title: "My Applications",
  description: "Track your job applications",
};

export default function UserApplicationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <p className="text-text-muted text-sm">Loading applications...</p>
        </div>
      }
    >
      <ApplicationsPage />
    </Suspense>
  );
}
