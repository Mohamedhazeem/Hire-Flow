import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { auth } from "@/app/features/auth/libs/auth";
import { withErrorHandler } from "@/lib/api-wrapper";

async function handlePOST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireRole(["admin", "super_admin"]);
  const { id } = await params;

  await auth.api.unbanUser({
    body: { userId: id },
    headers: request.headers,
  });

  return ok({ unbanned: true });
}

export const POST = withErrorHandler(handlePOST);
