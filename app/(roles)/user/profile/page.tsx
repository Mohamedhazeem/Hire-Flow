import { auth } from "@/app/features/auth/libs/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/app/features/user/components/profile-form";
import { PageHeader } from "@/components/layout/page-header";
import type { ProfileInput } from "@/app/features/user/schema/profile.schema";

export const metadata = {
  title: "Profile | Candidate Dashboard",
  description: "Manage your candidate profile",
};

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      headline: true,
      bio: true,
      location: true,
      skills: true,
      workMode: true,
      basePay: true,
      ctc: true,
      ectc: true,
      experiences: true,
      socialLinks: true,
    },
  });

  type SocialLink = NonNullable<ProfileInput["socialLinks"]>[number];

  const normalizeSocialLinks = (raw: unknown): ProfileInput["socialLinks"] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as ProfileInput["socialLinks"];
    if (typeof raw === "object") {
      return Object.entries(raw).map(([platform, url]) => ({
        platform: platform as SocialLink["platform"],
        url: String(url),
        label: "",
      }));
    }
    return [];
  };

  const defaultValues: ProfileInput | undefined = profile
    ? {
        headline: profile.headline ?? "",
        bio: profile.bio ?? "",
        location: profile.location ?? "",
        skills: profile.skills,
        workMode: (profile.workMode ?? null) as ProfileInput["workMode"],
        basePay: profile.basePay ?? null,
        ctc: profile.ctc ?? null,
        ectc: profile.ectc ?? null,
        experiences: (profile.experiences ?? []) as ProfileInput["experiences"],
        socialLinks: normalizeSocialLinks(profile.socialLinks),
      }
    : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Manage your personal and professional details"
      />
      <ProfileForm defaultValues={defaultValues} />
    </div>
  );
}
