import { NextRequest } from "next/server";
import { ok } from "@/lib/api/api-response";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { withRateLimit } from "@/lib/rate-limiting/di";
import { requireRole } from "@/app/features/shared/api/require-role";
import { checkBookmark } from "@/app/features/user/queries/bookmark-queries";

async function handleGET(_request: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  const session = await requireRole(["user"]);
  const { jobId } = await params;

  const result = await checkBookmark(session.id, jobId);
  return ok(result);
}

export const GET = withErrorHandler(withRateLimit(handleGET, "bookmarks:toggle"));
