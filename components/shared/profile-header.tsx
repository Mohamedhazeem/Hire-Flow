"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AvatarFallback } from "@/components/shared/avatar-fallback";

type ProfileHeaderProps = {
  name: string;
  email: string;
  image?: string | null;
  role: string;
  banned?: boolean;
  emailVerified?: boolean;
};

export function ProfileHeader({ name, email, image, role, banned, emailVerified }: ProfileHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center justify-center rounded-radius-md hover:bg-bg-elevated hover:text-text-heading size-8 transition-all"
        aria-label="back"
      >
        <ArrowLeftIcon className="size-5" />
      </button>
      <div className="flex items-center gap-4">
        <AvatarFallback name={name} image={image} size={48} className="size-12" />
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-text-heading">{name}</h1>
            <Badge variant="outline" className="capitalize text-xs font-medium">
              {role}
            </Badge>
            {banned && <Badge variant="destructive">Banned</Badge>}
            {!emailVerified && <Badge variant="outline">Unverified</Badge>}
          </div>
          <p className="text-sm text-text-muted mt-0.5">{email}</p>
        </div>
      </div>
    </div>
  );
}
