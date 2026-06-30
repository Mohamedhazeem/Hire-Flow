import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-wrapper";
import { listPublicJobs } from "@/app/features/jobs/queries/public-job-queries";

async function handleGET(request: NextRequest) {
  const url = new URL(request.url);
  const params = {
    page: url.searchParams.get("page") ? Number(url.searchParams.get("page")) : undefined,
    pageSize: url.searchParams.get("pageSize") ? Number(url.searchParams.get("pageSize")) : undefined,
    search: url.searchParams.get("search") || undefined,
    workMode: url.searchParams.get("workMode") || undefined,
    employmentType: url.searchParams.get("employmentType") || undefined,
    experienceLevel: url.searchParams.get("experienceLevel") || undefined,
    industry: url.searchParams.get("industry") || undefined,
    companyId: url.searchParams.get("companyId") || undefined,
    status: (url.searchParams.get("status") as "open" | "expired" | "all" | undefined) || undefined,
    sortBy: url.searchParams.get("sortBy") || undefined,
    sortOrder: url.searchParams.get("sortOrder") || undefined,
  };

  const result = await listPublicJobs(params);
  return ok({ data: result });
}

export const GET = withErrorHandler(handleGET);
