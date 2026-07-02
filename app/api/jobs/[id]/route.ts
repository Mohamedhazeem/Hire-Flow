import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { NotFoundError } from "@/lib/api-error";
import { withErrorHandler } from "@/lib/api-wrapper";
import { getPublicJobById } from "@/app/features/jobs/queries/public-job-queries";

async function handleGET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const job = await getPublicJobById(id);
  if (!job) throw new NotFoundError("Job not found");
  return ok(job);
}

export const GET = withErrorHandler(handleGET);
