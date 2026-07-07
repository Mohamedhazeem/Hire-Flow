import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import {
  BulkStatusTransitionSchema,
} from "@/app/features/recruiter/schema/application.schema";
import { ValidationError } from "@/lib/api-error";
import { withErrorHandler } from "@/lib/api-wrapper";
import { applicationService } from "@/lib/services/application-service";

async function handlePOST(request: NextRequest) {
  const session = await requireRole(["recruiter"]);
  const companyId = session.companyId;
  if (!companyId) throw new ValidationError("No company found for this recruiter");

  const body = await request.json().catch(() => ({}));
  const parsed = BulkStatusTransitionSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const result = await applicationService.bulkTransitionStatus(companyId, session.id, parsed.data);

  return ok(result);
}

export const POST = withErrorHandler(handlePOST);
