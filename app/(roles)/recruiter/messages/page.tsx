import { Suspense } from "react";
import { RecruiterMessagesPage } from "@/app/features/recruiter/components/recruiter-messages-page";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <p className="text-text-muted text-sm">Loading messages...</p>
        </div>
      }
    >
      <RecruiterMessagesPage />
    </Suspense>
  );
}
