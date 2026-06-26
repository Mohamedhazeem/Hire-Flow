import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { ListApplicantsParamsSchema } from "@/app/features/recruiter/schema/application.schema";
import { listApplicants } from "@/app/features/recruiter/queries/application-queries";
import { ValidationError, NotFoundError } from "@/lib/api-error";
import { withErrorHandler } from "@/lib/api-wrapper";
import { prisma } from "@/lib/prisma";

async function handleGET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const session = await requireRole(["recruiter"]);
  const companyId = session.companyId;
  if (!companyId) throw new ValidationError("No company found for this recruiter");

  const { jobId } = await params;

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, companyId: true },
  });

  if (!job || job.companyId !== companyId) {
    throw new NotFoundError("Job not found");
  }

  const { searchParams } = request.nextUrl;
  const validated = ListApplicantsParamsSchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    sortBy: searchParams.get("sortBy") ?? undefined,
    sortOrder: searchParams.get("sortOrder") ?? undefined,
  });

  if (!validated.success) {
    throw new ValidationError("Invalid query parameters");
  }

  const result = await listApplicants(jobId, companyId, validated.data);
  return ok(result);
}

export const GET = withErrorHandler(handleGET);
