import { requireRole } from "@/app/features/shared/api/require-role";
import { ok } from "@/lib/api/api-response";
import { getUserProfile } from "@/app/features/user/queries/profile-queries";

export async function GET() {
  const session = await requireRole(["user"]);
  const profile = await getUserProfile(session.id);
  return ok(profile);
}
