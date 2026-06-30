import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-wrapper";
import { requireRole } from "@/app/features/shared/api/require-role";

async function handleGET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const session = await requireRole(["user"]);
  const { jobId } = await params;

  const bookmark = await prisma.bookmark.findUnique({
    where: { userId_jobId: { userId: session.id, jobId } },
  });

  return ok({ bookmarked: !!bookmark });
}

export const GET = withErrorHandler(handleGET);
