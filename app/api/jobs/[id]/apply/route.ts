import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { ValidationError } from "@/lib/api-error";
import { withErrorHandler } from "@/lib/api-wrapper";
import { requireRole } from "@/app/features/shared/api/require-role";
import { ApplySchema } from "@/app/features/jobs/schema/application-submit.schema";
import { checkRateLimit } from "@/lib/rate-limiter";
import { revalidatePath } from "next/cache";
import { applicationService } from "@/lib/services/application-service";

async function handlePOST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireRole(["user"]);
  const { id: jobId } = await params;

  checkRateLimit(`apply:${session.id}`, { max: 10, windowMs: 60000 });

  const body = await request.json().catch(() => ({}));
  const parsed = ApplySchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const result = await applicationService.applyToJob(
    jobId,
    session.id,
    session.name,
    parsed.data,
  );

  revalidatePath("/jobs");
  revalidatePath("/user/applications");

  return ok(result, 201);
}

export const POST = withErrorHandler(handlePOST);
