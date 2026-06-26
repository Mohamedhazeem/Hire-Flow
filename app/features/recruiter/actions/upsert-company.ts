"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/app/features/shared/api/require-role";
import { CompanyProfileSchema } from "@/app/features/recruiter/schema/company.schema";
import { ValidationError } from "@/lib/api-error";
import { revalidatePath } from "next/cache";
import type { CompanyProfileInput } from "@/app/features/recruiter/schema/company.schema";

export async function upsertCompany(input: CompanyProfileInput) {
  const session = await requireRole(["recruiter"]);

  const parsed = CompanyProfileSchema.safeParse(input);

  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid company data");
  }

  const { name, description, website, logoUrl, industry } = parsed.data;

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

  revalidatePath("/recruiter/company");

  return { success: true, company };
}
