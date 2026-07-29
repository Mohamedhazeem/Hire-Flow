import { NextRequest } from "next/server";
import { ok } from "@/lib/api/api-response";
import { NotFoundError } from "@/lib/api/api-error";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { withRateLimit } from "@/lib/rate-limiting/di";
import { resolvePublicJob } from "@/lib/resolvers/job-resolver";
import { jobService } from "@/lib/services/job-service";

const handlePOST = withRateLimit(
  async (_request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const job = await resolvePublicJob(id);
    if (!job) throw new NotFoundError("Job not found");

    const result = await jobService.incrementView(job.id);
    return ok(result);
  },
  "jobs:view",
);

export const POST = withErrorHandler(handlePOST);
