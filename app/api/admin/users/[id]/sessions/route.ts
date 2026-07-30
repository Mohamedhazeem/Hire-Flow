import { NextRequest } from "next/server";
import { ok } from "@/lib/api/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { listUserSessions } from "@/app/features/admin/queries/user-queries";
import { auth } from "@/app/features/auth/libs/auth";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { withRateLimit } from "@/lib/rate-limiting/di";

async function handleGET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireRole(["admin", "super_admin"]);
  const { id } = await params;

  const sessions = await listUserSessions(id);
  return ok(sessions);
}

async function handleDELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireRole(["admin", "super_admin"]);
  const { id } = await params;

  await auth.api.revokeUserSessions({
    body: { userId: id },
    headers: request.headers,
  });

  return ok({ revoked: true });
}

export const GET = withErrorHandler(withRateLimit(handleGET, "admin:users:detail"));
export const DELETE = withErrorHandler(withRateLimit(handleDELETE, "admin:users:detail"));
