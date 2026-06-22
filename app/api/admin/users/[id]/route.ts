import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { getUserById } from "@/app/features/admin/queries/user-queries";
import { requireAdmin } from "@/app/features/admin/api/require-admin";
import { auth } from "@/app/features/auth/libs/auth";
import { UnauthorizedError, ForbiddenError } from "@/lib/api-error";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const user = await getUserById(id);
    if (!user) {
      return fail("User not found", 404);
    }

    return ok(user);
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      return fail("Unauthorized", 401);
    }
    return fail("Internal server error", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const adminUser = await requireAdmin();
    const { id } = await params;

    if (adminUser.id === id) {
      return fail("You cannot remove yourself", 400);
    }

    await auth.api.removeUser({ body: { userId: id }, headers: _request.headers });
    return ok({ deleted: true });
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      return fail("Unauthorized", 401);
    }
    return fail("Internal server error", 500);
  }
}
