import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireAdmin } from "@/app/features/admin/api/require-admin";
import { AdminListJobsParamsSchema } from "@/app/features/admin/schema/admin.schema";
import { listJobs } from "@/app/features/admin/queries/job-queries";
import { ValidationError } from "@/lib/api-error";
import { withErrorHandler } from "@/lib/api-wrapper";

async function handleGET(request: NextRequest) {
  await requireAdmin();

  const { searchParams } = request.nextUrl;
  const params = AdminListJobsParamsSchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    workMode: searchParams.get("workMode") ?? undefined,
    employmentType: searchParams.get("employmentType") ?? undefined,
    experienceLevel: searchParams.get("experienceLevel") ?? undefined,
    sortBy: searchParams.get("sortBy") ?? undefined,
    sortOrder: searchParams.get("sortOrder") ?? undefined,
  });

  if (!params.success) {
    throw new ValidationError("Invalid query parameters");
  }

  const result = await listJobs(params.data);
  return ok(result);
}

export const GET = withErrorHandler(handleGET);
