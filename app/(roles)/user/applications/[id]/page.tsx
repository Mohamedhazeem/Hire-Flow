import { ApplicationDetailView } from "@/app/features/user/components/application-detail-view";

export const metadata = {
  title: "Application Details",
  description: "View your application details",
};

export default async function UserApplicationDetailPage() {
  return <ApplicationDetailView />;
}
