import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { NotFoundError } from "@/lib/api-error";
import { withErrorHandler } from "@/lib/api-wrapper";
import { requireRole } from "@/app/features/shared/api/require-role";
import { revalidatePath } from "next/cache";
import { getUserApplicationDetail } from "@/app/features/user/queries/user-application-queries";
import { userService } from "@/lib/services/user-service";

async function handleGET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireRole(["user"]);
  const { id } = await params;

  const detail = await getUserApplicationDetail(id, session.id);
  if (!detail) throw new NotFoundError("Application not found");

  return ok(detail);
}

async function handleDELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireRole(["user"]);
  const { id } = await params;

  await userService.withdrawApplication(id, session.id);

  revalidatePath("/user/applications");

  return ok(undefined, 204);
}

export const GET = withErrorHandler(handleGET);
export const DELETE = withErrorHandler(handleDELETE);
