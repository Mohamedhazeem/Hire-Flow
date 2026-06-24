import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { RoleSchema } from "@/app/features/auth/schema/role.schema";
import { auth } from "@/app/features/auth/libs/auth";
import { ValidationError } from "@/lib/api-error";
import { withErrorHandler } from "@/lib/api-wrapper";

async function handlePOST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireRole(["admin", "super_admin"]);
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const role = RoleSchema.safeParse(body.role);

  if (!role.success) {
    throw new ValidationError("Invalid role");
  }

  await auth.api.adminUpdateUser({
    body: { userId: id, data: { role: role.data } },
    headers: request.headers,
  });

  return ok({ roleSet: role.data });
}

export const POST = withErrorHandler(handlePOST);
