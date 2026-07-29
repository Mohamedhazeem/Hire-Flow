import { NextRequest } from "next/server";
import { ok } from "@/lib/api/api-response";
import { NotFoundError } from "@/lib/api/api-error";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { getPublicJobById } from "@/app/features/jobs/queries/public-job-queries";

async function handleGET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getPublicJobById(id);
  if (!job) throw new NotFoundError("Job not found");
  const response = ok(job);
  response.headers.set("Cache-Control", "public, max-age=60, stale-while-revalidate=30");
  return response;
}

export const GET = withErrorHandler(handleGET);
