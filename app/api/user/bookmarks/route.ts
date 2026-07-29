import { NextRequest } from "next/server";
import { ok } from "@/lib/api/api-response";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { withRateLimit } from "@/lib/rate-limiting/di";
import { requireRole } from "@/app/features/shared/api/require-role";
import { userService } from "@/lib/services/user-service";
import { listUserBookmarks } from "@/app/features/user/queries/bookmark-queries";

const handleGET = withRateLimit(async (request: NextRequest) => {
  const session = await requireRole(["user"]);
  const url = new URL(request.url);
  const page = url.searchParams.get("page") ? Number(url.searchParams.get("page")) : undefined;
  const pageSize = url.searchParams.get("pageSize") ? Number(url.searchParams.get("pageSize")) : undefined;

  const bookmarks = await listUserBookmarks(session.id, page ? { page, pageSize } : undefined);
  return ok(bookmarks);
}, "bookmarks:list");

const handlePOST = withRateLimit(async (request: NextRequest) => {
  const session = await requireRole(["user"]);
  const body = await request.json();
  const { jobId } = body as { jobId: string };

  if (!jobId) {
    return ok({ error: "Invalid jobId" }, 400);
  }

  const result = await userService.toggleBookmark(session.id, jobId);
  return ok(result);
}, "bookmarks:toggle");

export const GET = withErrorHandler(handleGET);
export const POST = withErrorHandler(handlePOST);
