import { notFound } from "next/navigation";
import { requireRole } from "@/app/features/shared/api/require-role";
import { prisma } from "@/lib/prisma";
import { AdminUserProfileView } from "@/app/features/admin/components/user-profile-view";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminUserDetailPage({ params }: Props) {
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
      image: true,
      createdAt: true,
      updatedAt: true,
      profile: {
        select: {
          headline: true,
          bio: true,
          skills: true,
          experiences: true,
          location: true,
          basePay: true,
          ctc: true,
          socialLinks: true,
        },
      },
      resumes: {
        select: {
          id: true,
          label: true,
          fileUrl: true,
          isPrimary: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) notFound();

  const serialized = {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    banExpiresAt: user.banExpiresAt?.toISOString() ?? null,
    profile: user.profile
      ? {
          ...user.profile,
        }
      : null,
    resumes: user.resumes.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
  };

  return <AdminUserProfileView user={serialized} />;
}
