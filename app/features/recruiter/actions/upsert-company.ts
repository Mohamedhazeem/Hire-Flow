"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/app/features/shared/api/require-role";
import { CompanyProfileSchema } from "@/app/features/recruiter/schema/company.schema";
import { ForbiddenError, ValidationError } from "@/lib/api/api-error";
import { revalidatePath } from "next/cache";
import { deleteUpload } from "@/lib/upload";
import type { CompanyProfileInput } from "@/app/features/recruiter/schema/company.schema";

export async function upsertCompany(input: CompanyProfileInput) {
  const session = await requireRole(["recruiter"]);

  if (session.memberRole && session.memberRole !== "owner") {
    throw new ForbiddenError("Only the company owner can edit company profile");
  }

  const parsed = CompanyProfileSchema.safeParse(input);

  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid company data");
  }

  const { name, description, website, logoUrl, industry } = parsed.data;

  // Fetch the current logo before upserting so we can clean up the old file
  const existingCompany = await prisma.company.findUnique({
    where: { recruiterId: session.id },
    select: { logoUrl: true },
  });

  const company = await prisma.company.upsert({
    where: { recruiterId: session.id },
    create: {
      recruiterId: session.id,
      name,
      description: description || null,
      website: website || null,
      logoUrl: logoUrl || null,
      industry: industry || null,
    },
    update: {
      name,
      description: description || null,
      website: website || null,
      logoUrl: logoUrl || null,
      industry: industry || null,
    },
  });

  // Clean up orphaned logo file if the URL changed
  const previousLogoUrl = existingCompany?.logoUrl;
  if (previousLogoUrl && previousLogoUrl !== (logoUrl || null)) {
    await deleteUpload(previousLogoUrl);
  }

  if (!session.memberRole) {
    await prisma.companyTeamMember.create({
      data: {
        companyId: company.id,
        userId: session.id,
        role: "owner",
      },
    });
  }

  revalidatePath("/recruiter/company");

  return { success: true, company };
}
