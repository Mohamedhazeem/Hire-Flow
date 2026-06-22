import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { requireAdmin } from "@/app/features/admin/api/require-admin";
import { AdminBanUserSchema } from "@/app/features/admin/schema/admin.schema";
import { auth } from "@/app/features/auth/libs/auth";
import { UnauthorizedError, ForbiddenError } from "@/lib/api-error";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminUser = await requireAdmin();
    const { id } = await params;

    if (adminUser.id === id) {
      return fail("You cannot ban yourself", 400);
    }

    const body = await request.json().catch(() => ({}));
    const input = AdminBanUserSchema.safeParse(body);

    if (!input.success) {
      return fail("Invalid ban parameters", 400);
    }

    await auth.api.banUser({
      body: {
        userId: id,
        banReason: input.data.banReason,
        banExpiresIn: input.data.banExpiresIn,
      },
      headers: request.headers,
    });

    return ok({ banned: true });
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      return fail("Unauthorized", 401);
    }
    return fail("Internal server error", 500);
  }
}
