import { NextRequest } from "next/server";
import { ok } from "@/lib/api/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/api/api-wrapper";

async function handleGET(request: NextRequest) {
  const recruiter = await requireRole(["recruiter"]);
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") ?? "";

  if (q.length < 1) {
    return ok([]);
  }

  const applications = await prisma.application.findMany({
    where: {
      job: {
        OR: [
          { recruiterId: recruiter.id },
          { company: { teamMembers: { some: { userId: recruiter.id } } } },
        ],
      },
      user: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
    },
    select: {
      userId: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    distinct: ["userId"],
    take: 20,
  });

  const users = applications.map((a) => ({
    id: a.user.id,
    name: a.user.name,
    email: a.user.email,
    role: a.user.role,
    company: null,
  }));

  return ok(users);
}

export const GET = withErrorHandler(handleGET);
