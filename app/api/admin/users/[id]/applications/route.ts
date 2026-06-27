import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { withErrorHandler } from "@/lib/api-wrapper";
import { getUserApplications } from "@/app/features/admin/queries/applicant-queries";

async function handleGET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireRole(["admin", "super_admin"]);
  const { id } = await params;
  const data = await getUserApplications(id);
  return ok(data);
}

export const GET = withErrorHandler(handleGET);
