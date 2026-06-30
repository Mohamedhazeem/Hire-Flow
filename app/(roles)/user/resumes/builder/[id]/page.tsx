import { notFound } from "next/navigation";
import { requireRole } from "@/app/features/shared/api/require-role";
import { prisma } from "@/lib/prisma";
import { ResumeBuilderForm } from "@/app/features/user/components/resume-builder-form";
import { PageHeader } from "@/components/layout/page-header";
import type { BuilderResumeInput } from "@/app/features/user/schema/resume.schema";

export const metadata = {
  title: "Edit Resume | Candidate Dashboard",
  description: "Edit your builder-created resume",
};

export default async function EditBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["user"]);

  const { id } = await params;

  const resume = await prisma.resume.findUnique({ where: { id } });
  if (!resume || resume.userId !== session.id) {
    notFound();
  }

  if (resume.fileUrl !== null) {
    notFound();
  }

  const builderData = resume.builderData as Record<string, unknown> | null;

  const defaultValues: BuilderResumeInput = {
    label: resume.label,
    summary: (builderData?.summary as string) ?? "",
    educations: (builderData?.educations as BuilderResumeInput["educations"]) ?? [],
    experiences: (builderData?.experiences as BuilderResumeInput["experiences"]) ?? [],
    skills: (builderData?.skills as string[]) ?? [],
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Resume"
        description="Update your builder-created resume"
      />
      <ResumeBuilderForm defaultValues={defaultValues} resumeId={id} />
    </div>
  );
}
