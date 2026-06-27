import AdminMessagesPage from "@/app/features/admin/components/admin-message-page";
import { Suspense } from "react";
export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <p className="text-text-muted text-sm">Loading messages...</p>
        </div>
      }
    >
      <AdminMessagesPage />
    </Suspense>
  );
}
