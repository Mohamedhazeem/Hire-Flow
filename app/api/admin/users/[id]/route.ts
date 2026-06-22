import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { getUserById } from "@/app/features/admin/queries/user-queries";
import { requireAdmin } from "@/app/features/admin/api/require-admin";
import { auth } from "@/app/features/auth/libs/auth";
import { withErrorHandler } from "@/lib/api-wrapper";

async function handleGET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await params;

  const user = await getUserById(id);
  if (!user) {
    return fail("User not found", 404);
  }

  return ok(user);
}

async function handleDELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminUser = await requireAdmin();
  const { id } = await params;

  if (adminUser.id === id) {
    return fail("You cannot remove yourself", 400);
  }

  await auth.api.removeUser({ body: { userId: id }, headers: _request.headers });
  return ok({ deleted: true });
}

export const GET = withErrorHandler(handleGET);
export const DELETE = withErrorHandler(handleDELETE);
