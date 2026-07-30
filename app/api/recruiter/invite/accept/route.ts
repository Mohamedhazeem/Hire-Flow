import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { RecruiterAcceptInviteSchema } from "@/app/features/recruiter/schema/team.schema";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { withRateLimit } from "@/lib/rate-limiting/di";
import { inviteService } from "@/lib/services/invite-service";

async function handlePOST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const input = RecruiterAcceptInviteSchema.safeParse(body);

  if (!input.success) {
    return fail("Invalid token", 400);
  }

  const result = await inviteService.acceptRecruiterInvite(input.data.token);

  if (!result.accepted) {
    return fail(result.error ?? "No account found with this email.", 400);
  }

  return ok(result);
}

export const POST = withErrorHandler(withRateLimit(handlePOST, "recruiter:invite:accept"));
