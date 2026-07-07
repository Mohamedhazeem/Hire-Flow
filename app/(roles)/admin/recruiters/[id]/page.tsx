import { notFound } from "next/navigation";
import { requireRole } from "@/app/features/shared/api/require-role";
import { prisma } from "@/lib/prisma";
import { AdminRecruiterProfileView } from "@/app/features/admin/components/recruiter-profile-view";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminRecruiterDetailPage({ params }: Props) {
  await requireRole(["admin", "super_admin"]);
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      banned: true,
      banReason: true,
      banExpiresAt: true,
      emailVerified: true,
      createdAt: true,
      companyMembership: {
        select: {
          role: true,
          company: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  if (!user || user.role !== "recruiter") notFound();

  const jobs = user.companyMembership
    ? await prisma.job.findMany({
        where: {
          companyId: user.companyMembership.company.id,
          status: { not: "draft" },
        },
        select: {
          id: true,
          title: true,
          status: true,
          isActive: true,
          createdAt: true,
          applicationDeadline: true,
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      })
    : [];

  const serialized = {
    ...user,
    createdAt: user.createdAt.toISOString(),
    banExpiresAt: user.banExpiresAt?.toISOString() ?? null,
    companyMembership: user.companyMembership
      ? {
          role: user.companyMembership.role,
          companyName: user.companyMembership.company.name,
          companyId: user.companyMembership.company.id,
        }
      : null,
    jobs: jobs.map((j) => ({
      id: j.id,
      title: j.title,
      status: j.status,
      isActive: j.isActive,
      createdAt: j.createdAt.toISOString(),
      applicationDeadline: j.applicationDeadline?.toISOString() ?? null,
      applicationCount: j._count.applications,
    })),
  };

  return <AdminRecruiterProfileView user={serialized} />;
}
