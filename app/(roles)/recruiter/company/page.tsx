import { auth } from "@/app/features/auth/libs/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { CompanyForm } from "@/app/features/recruiter/components/company-form";
import { PageHeader } from "@/components/layout/page-header";
import type { CompanyProfileInput } from "@/app/features/recruiter/schema/company.schema";

export const metadata = {
  title: "Company Profile | Recruiter Dashboard",
  description: "Manage your company details",
};

export default async function CompanyPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  const company = session?.user
    ? await prisma.company.findUnique({
        where: { recruiterId: session.user.id },
        select: {
          name: true,
          description: true,
          website: true,
          logoUrl: true,
          industry: true,
        },
      })
    : null;

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
      />
      <CompanyForm defaultValues={defaultValues} />
    </div>
  );
}
