import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { AdminAcceptInviteSchema } from "@/app/features/admin/schema/admin.schema";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { withRateLimit } from "@/lib/rate-limiting/di";
import { inviteService } from "@/lib/services/invite-service";

async function handlePOST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const input = AdminAcceptInviteSchema.safeParse(body);

  if (!input.success) {
    return fail("Invalid token", 400);
  }

  const result = await inviteService.acceptAdminInvite(input.data.token);
  return ok(result);
}

export const POST = withErrorHandler(withRateLimit(handlePOST, "admin:invite:accept"));
