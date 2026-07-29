import { NextRequest } from "next/server";
import { ok } from "@/lib/api/api-response";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { withRateLimit } from "@/lib/rate-limiting/di";
import { requireRole } from "@/app/features/shared/api/require-role";
import { listUserApplications } from "@/app/features/user/queries/user-application-queries";

const handleGET = withRateLimit(async (request: NextRequest) => {
  const session = await requireRole(["user"]);
  const url = new URL(request.url);

  const params = {
    page: url.searchParams.get("page") ? Number(url.searchParams.get("page")) : undefined,
    pageSize: url.searchParams.get("pageSize") ? Number(url.searchParams.get("pageSize")) : undefined,
    status: url.searchParams.get("status") || undefined,
    search: url.searchParams.get("search") || undefined,
  };

  const result = await listUserApplications(session.id, params);
  return ok(result);
}, "applications:list");

export const GET = withErrorHandler(handleGET);
