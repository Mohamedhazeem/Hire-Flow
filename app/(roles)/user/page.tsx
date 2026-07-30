import { Activity } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ActivityPanel } from "@/app/features/user/components/activity-panel";

export const metadata = {
  title: "Activity",
  description: "Track your job applications and activity",
};

export default function UserDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity"
        description="Track your job applications and activity"
        icon={<Activity className="size-5" />}
      />
      <ActivityPanel />
    </div>
  );
}
