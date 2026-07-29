import { NextRequest } from "next/server";
import { ok } from "@/lib/api/api-response";
import { ValidationError, NotFoundError } from "@/lib/api/api-error";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { requireRole } from "@/app/features/shared/api/require-role";
import { ApplySchema } from "@/app/features/jobs/schema/application-submit.schema";
import { withRateLimit } from "@/lib/rate-limiting/di";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { applicationService } from "@/lib/services/application-service";

const handlePOST = withRateLimit(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const session = await requireRole(["user"]);
  const { id } = await params;

  const job = await prisma.job.findFirst({
    where: { OR: [{ slug: id }, { id }] },
  });
  if (!job) throw new NotFoundError("Job not found");
  if (!job.isActive || job.status !== "active") throw new ValidationError("Job is no longer accepting applications");

  const body = await request.json().catch(() => ({}));
  const parsed = ApplySchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const result = await applicationService.applyToJob(job.id, session.id, session.name, parsed.data);

  revalidatePath("/jobs");
  revalidatePath("/user/applications");

  return ok(result, 201);
}, "jobs:apply");

export const POST = withErrorHandler(handlePOST);
