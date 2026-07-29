import { NextRequest } from "next/server";
import { ok } from "@/lib/api/api-response";
import { NotFoundError } from "@/lib/api/api-error";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import {
  getPublicJobById,
  listCompanyJobs,
  listSimilarJobs,
} from "@/app/features/jobs/queries/public-job-queries";

async function handleGET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getPublicJobById(id);
  if (!job) throw new NotFoundError("Job not found");

  const [companyJobs, similarJobs] = await Promise.all([
    listCompanyJobs(job.companyId, job.id, 5),
    listSimilarJobs(
      {
        id: job.id,
        companyId: job.companyId,
        skills: job.skills,
        workMode: job.workMode,
        experienceLevel: job.experienceLevel,
      },
      5,
    ),
  ]);

  const response = ok({ companyJobs, similarJobs });
  response.headers.set("Cache-Control", "public, max-age=60, stale-while-revalidate=30");
  return response;
}

export const GET = withErrorHandler(handleGET);
