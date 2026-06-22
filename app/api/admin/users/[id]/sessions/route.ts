import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireAdmin } from "@/app/features/admin/api/require-admin";
import { listUserSessions } from "@/app/features/admin/queries/user-queries";
import { auth } from "@/app/features/auth/libs/auth";
import { withErrorHandler } from "@/lib/api-wrapper";

async function handleGET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await params;

  const sessions = await listUserSessions(id);
  return ok(sessions);
}

async function handleDELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await params;

  await auth.api.revokeUserSessions({
    body: { userId: id },
    headers: request.headers,
  });

  return ok({ revoked: true });
}

export const GET = withErrorHandler(handleGET);
export const DELETE = withErrorHandler(handleDELETE);
