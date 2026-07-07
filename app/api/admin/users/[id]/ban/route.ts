import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { AdminBanUserSchema } from "@/app/features/admin/schema/admin.schema";
import { ValidationError } from "@/lib/api-error";
import { withErrorHandler } from "@/lib/api-wrapper";
import { userAdminService } from "@/lib/services/user-admin-service";

async function handlePOST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminUser = await requireRole(["admin", "super_admin"]);
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const input = AdminBanUserSchema.safeParse(body);

  if (!input.success) {
    throw new ValidationError("Invalid ban parameters");
  }

  const result = await userAdminService.banUser(
    adminUser.id,
    id,
    input.data.banReason,
    input.data.banExpiresIn,
    request.headers,
  );

  return ok(result);
}

export const POST = withErrorHandler(handlePOST);
