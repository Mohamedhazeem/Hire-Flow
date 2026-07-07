import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-wrapper";
import { checkRateLimit } from "@/lib/rate-limiter";
import { jobService } from "@/lib/services/job-service";

async function handlePOST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  checkRateLimit(`view:${id}`, { max: 100, windowMs: 60000 });

  const result = await jobService.incrementView(id);
  return ok(result);
}

export const POST = withErrorHandler(handlePOST);
