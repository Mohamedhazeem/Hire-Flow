import { ResumeList } from "@/app/features/user/components/resume-list";
import { PageHeader } from "@/components/layout/page-header";
import { ScrollTextIcon } from "lucide-react";

export const metadata = {
  title: "Resumes | Candidate Dashboard",
  description: "Manage your resumes",
};

export default function ResumesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Resumes" description="Upload, build, and manage your resumes (max 5)" icon={<ScrollTextIcon className="size-5" />} />
      <ResumeList />
    </div>
  );
}
