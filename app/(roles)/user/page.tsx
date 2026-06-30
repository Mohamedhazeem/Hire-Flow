import { ActivityPanel } from "@/app/features/user/components/activity-panel";

export const metadata = {
  title: "Activity",
  description: "Track your job applications and activity",
};

export default function UserDashboardPage() {
  return <ActivityPanel />;
}
