import { auth } from "@/app/features/auth/libs/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { CompanyForm } from "@/app/features/recruiter/components/company-form";
import { PageHeader } from "@/components/layout/page-header";
import { Building2Icon } from "lucide-react";
import type { CompanyProfileInput } from "@/app/features/recruiter/schema/company.schema";

export const metadata = {
  title: "Company Profile | Recruiter Dashboard",
  description: "Manage your company details",
};

export default async function CompanyPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) return null;

  const membership = await prisma.companyTeamMember.findUnique({
    where: { userId: session.user.id },
    select: { companyId: true, role: true },
  });

  const isOwner = membership?.role === "owner" || !membership;

  let company = null;

  if (membership) {
    company = await prisma.company.findUnique({
      where: { id: membership.companyId },
      select: {
        name: true,
        description: true,
        website: true,
        logoUrl: true,
        industry: true,
      },
    });
  } else {
    company = await prisma.company.findUnique({
      where: { recruiterId: session.user.id },
      select: {
        name: true,
        description: true,
        website: true,
        logoUrl: true,
        industry: true,
      },
    });
  }

  const defaultValues: CompanyProfileInput | undefined = company
    ? {
        name: company.name,
        description: company.description ?? "",
        website: company.website ?? "",
        logoUrl: company.logoUrl ?? "",
        industry: company.industry ?? "",
      }
    : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Profile"
        description="Manage your company details visible to candidates"
        icon={<Building2Icon className="size-5" />}
      />
      <CompanyForm defaultValues={defaultValues} readOnly={!isOwner} />
    </div>
  );
}
