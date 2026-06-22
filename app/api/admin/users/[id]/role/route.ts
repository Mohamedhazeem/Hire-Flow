import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { requireAdmin } from "@/app/features/admin/api/require-admin";
import { RoleSchema } from "@/app/features/auth/schema/role.schema";
import { auth } from "@/app/features/auth/libs/auth";
import { UnauthorizedError, ForbiddenError } from "@/lib/api-error";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await request.json().catch(() => ({}));
    const role = RoleSchema.safeParse(body.role);

    if (!role.success) {
      return fail("Invalid role", 400);
    }

    await auth.api.adminUpdateUser({
      body: { userId: id, data: { role: role.data } },
      headers: request.headers,
    });

    return ok({ roleSet: role.data });
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      return fail("Unauthorized", 401);
    }
    return fail("Internal server error", 500);
  }
}
