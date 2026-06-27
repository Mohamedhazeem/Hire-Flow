import { Suspense } from "react";
import { NotificationsPage } from "@/app/features/notifications/components/notifications-page";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <p className="text-text-muted text-sm">Loading notifications...</p>
        </div>
      }
    >
      <NotificationsPage messagesBasePath="/user/messages" />
    </Suspense>
  );
}
