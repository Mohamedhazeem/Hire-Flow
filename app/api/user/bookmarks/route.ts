import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-wrapper";
import { requireRole } from "@/app/features/shared/api/require-role";
import { userService } from "@/lib/services/user-service";
import { listUserBookmarks } from "@/app/features/user/queries/bookmark-queries";

async function handleGET() {
  const session = await requireRole(["user"]);
  const bookmarks = await listUserBookmarks(session.id);
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
