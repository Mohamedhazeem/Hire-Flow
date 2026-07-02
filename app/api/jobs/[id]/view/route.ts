import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-wrapper";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limiter";
import { NotFoundError } from "@/lib/api-error";

async function handlePOST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!job) throw new NotFoundError("Job not found");

  checkRateLimit(`view:${id}`, { max: 100, windowMs: 60000 });

  await prisma.job.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  return ok({ success: true });
}

export const POST = withErrorHandler(handlePOST);
