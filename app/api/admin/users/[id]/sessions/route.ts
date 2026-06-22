import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { requireAdmin } from "@/app/features/admin/api/require-admin";
import { listUserSessions } from "@/app/features/admin/queries/user-queries";
import { auth } from "@/app/features/auth/libs/auth";
import { UnauthorizedError, ForbiddenError } from "@/lib/api-error";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const sessions = await listUserSessions(id);
    return ok(sessions);
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      return fail("Unauthorized", 401);
    }
    return fail("Internal server error", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await auth.api.revokeUserSessions({
      body: { userId: id },
      headers: request.headers,
    });

    return ok({ revoked: true });
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      return fail("Unauthorized", 401);
    }
    return fail("Internal server error", 500);
  }
}
