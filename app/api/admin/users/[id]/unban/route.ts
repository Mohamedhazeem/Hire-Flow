import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { requireAdmin } from "@/app/features/admin/api/require-admin";
import { auth } from "@/app/features/auth/libs/auth";
import { UnauthorizedError, ForbiddenError } from "@/lib/api-error";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    await auth.api.unbanUser({
      body: { userId: id },
      headers: request.headers,
    });

    return ok({ unbanned: true });
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      return fail("Unauthorized", 401);
    }
    return fail("Internal server error", 500);
  }
}
