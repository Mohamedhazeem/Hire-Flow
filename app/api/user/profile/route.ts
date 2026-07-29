import { requireRole } from "@/app/features/shared/api/require-role";
import { ok } from "@/lib/api/api-response";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { withRateLimit } from "@/lib/rate-limiting/di";
import { getUserProfile } from "@/app/features/user/queries/profile-queries";

const handleGET = withRateLimit(async () => {
  const session = await requireRole(["user", "recruiter", "admin"]);
  const profile = await getUserProfile(session.id);
  return ok(profile);
}, "profile:read");

export const GET = withErrorHandler(handleGET);
