import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/api-wrapper";

async function handleGET(request: NextRequest) {
  const adminUser = await requireRole(["admin", "super_admin"]);
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") ?? "";

  if (q.length < 1) {
    return ok([]);
  }

  const users = await prisma.user.findMany({
    where: {
      id: { not: adminUser.id },
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { company: { name: { contains: q, mode: "insensitive" } } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      company: { select: { name: true } },
    },
    take: 20,
    orderBy: { name: "asc" },
  });

  return ok(users);
}

export const GET = withErrorHandler(handleGET);
