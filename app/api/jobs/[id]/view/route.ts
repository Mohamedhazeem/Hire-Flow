import { NextRequest } from "next/server";
import { ok } from "@/lib/api/api-response";
import { NotFoundError } from "@/lib/api/api-error";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { checkRateLimit } from "@/lib/rate-limit";
import { resolvePublicJob } from "@/lib/resolvers/job-resolver";
import { jobService } from "@/lib/services/job-service";

async function handlePOST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Resolve slug → DB ID (or pass through if it's already an ID)
  const job = await resolvePublicJob(id);
  if (!job) throw new NotFoundError("Job not found");

  checkRateLimit(`view:${job.id}`, { max: 100, windowMs: 60000 });

  const result = await jobService.incrementView(job.id);
  return ok(result);
}

export const POST = withErrorHandler(handlePOST);
