import { SavedJobsPage } from "@/app/features/user/components/saved-jobs-page";

export const metadata = {
  title: "Saved Jobs",
  description: "Jobs you've bookmarked for later",
};

export default function UserSavedJobsPage() {
  return <SavedJobsPage />;
}
