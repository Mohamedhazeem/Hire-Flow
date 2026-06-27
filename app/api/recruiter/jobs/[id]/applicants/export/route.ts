import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/features/shared/api/require-role";
import { NotFoundError, ValidationError } from "@/lib/api-error";
import { withErrorHandler } from "@/lib/api-wrapper";
import { prisma } from "@/lib/prisma";
import { exportApplicantsAsCsv } from "@/app/features/recruiter/queries/export-queries";
import { format } from "date-fns";

async function handleGET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireRole(["recruiter"]);
  const companyId = session.companyId;
  if (!companyId) throw new ValidationError("No company found for this recruiter");

  const jobId = (await params).id;

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, title: true, companyId: true },
  });

  if (!job || job.companyId !== companyId) {
    throw new NotFoundError("Job not found");
  }

  const search = request.nextUrl.searchParams.get("search") ?? undefined;
  const status = request.nextUrl.searchParams.get("status") ?? undefined;

  const stream = await exportApplicantsAsCsv(jobId, companyId, { search, status });

  const sanitizedTitle = job.title.replace(/[^a-zA-Z0-9_-]/g, "_");
  const dateStr = format(new Date(), "yyyy-MM-dd");

  return new NextResponse(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="applicants-${sanitizedTitle}-${dateStr}.csv"`,
    },
  });
}

export const GET = withErrorHandler(handleGET);
