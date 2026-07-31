import { NextRequest, NextResponse } from "next/server";
import { ok } from "@/lib/api/api-response";
import { NotFoundError } from "@/lib/api/api-error";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { requireRole } from "@/app/features/shared/api/require-role";
import { revalidatePath } from "next/cache";
import { getUserApplicationDetail, getUserApplicationByJobSlug } from "@/app/features/user/queries/user-application-queries";
import { userService } from "@/lib/services/user-service";

async function resolveApplication(id: string, userId: string) {
  const detail = await getUserApplicationDetail(id, userId);
  if (detail) return detail;

  const isLikelySlug = id.includes("-") && !id.startsWith("app_");
  if (isLikelySlug) {
    return getUserApplicationByJobSlug(userId, id);
  }
  return null;
}

async function handleGET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(["user"]);
  const { id } = await params;

  const detail = await resolveApplication(id, session.id);
  if (!detail) throw new NotFoundError("Application not found");

  return ok(detail);
}

async function handleDELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireRole(["user"]);
  const { id } = await params;

  const detail = await resolveApplication(id, session.id);
  if (!detail) throw new NotFoundError("Application not found");

  await userService.withdrawApplication(detail.id, session.id);

  revalidatePath("/user/applications");

  return new NextResponse(null, { status: 204 });
}

export const GET = withErrorHandler(handleGET);
export const DELETE = withErrorHandler(handleDELETE);
