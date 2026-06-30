import { ResumeList } from "@/app/features/user/components/resume-list";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = {
  title: "Resumes | Candidate Dashboard",
  description: "Manage your resumes",
};

export default function ResumesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Resumes"
        description="Upload, build, and manage your resumes (max 5)"
      />
      <ResumeList />
    </div>
  );
}
