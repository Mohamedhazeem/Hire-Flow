import { NextRequest } from "next/server";
import { ok } from "@/lib/api/api-response";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { requireRole } from "@/app/features/shared/api/require-role";
import { userService } from "@/lib/services/user-service";
import { listUserBookmarks } from "@/app/features/user/queries/bookmark-queries";

async function handleGET(request: NextRequest) {
  const session = await requireRole(["user"]);
  const url = new URL(request.url);
  const page = url.searchParams.get("page")
    ? Number(url.searchParams.get("page"))
    : undefined;
  const pageSize = url.searchParams.get("pageSize")
    ? Number(url.searchParams.get("pageSize"))
    : undefined;

  const bookmarks = await listUserBookmarks(session.id, page ? { page, pageSize } : undefined);
  return ok(bookmarks);
}

async function handlePOST(request: NextRequest) {
  const session = await requireRole(["user"]);
  const body = await request.json();
  const { jobId } = body as { jobId: string };

  if (!jobId) {
    return ok({ error: "Invalid jobId" }, 400);
  }

  const result = await userService.toggleBookmark(session.id, jobId);
  return ok(result);
}

export const GET = withErrorHandler(handleGET);
export const POST = withErrorHandler(handlePOST);
