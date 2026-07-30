import { NextRequest } from "next/server";
import { ok } from "@/lib/api/api-response";
import { getUserById } from "@/app/features/admin/queries/user-queries";
import { requireRole } from "@/app/features/shared/api/require-role";
import { auth } from "@/app/features/auth/libs/auth";
import { NotFoundError, ValidationError } from "@/lib/api/api-error";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { withRateLimit } from "@/lib/rate-limiting/di";

async function handleGET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireRole(["admin", "super_admin"]);
  const { id } = await params;

  const user = await getUserById(id);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  return ok(user);
}

async function handleDELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminUser = await requireRole(["admin", "super_admin"]);
  const { id } = await params;

  if (adminUser.id === id) {
    throw new ValidationError("You cannot remove yourself");
  }

  await auth.api.removeUser({ body: { userId: id }, headers: _request.headers });
  return ok({ deleted: true });
}

export const GET = withErrorHandler(withRateLimit(handleGET, "admin:users:detail"));
export const DELETE = withErrorHandler(withRateLimit(handleDELETE, "admin:users:manage"));
