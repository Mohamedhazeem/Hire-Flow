import { MailIcon, BadgeCheckIcon, CalendarIcon, UserIcon } from "lucide-react";
import { SectionCard } from "@/components/shared/section-card";
import { IconBox } from "@/components/shared/icon-box";

type AccountCardProps = {
  email: string;
  emailVerified: boolean;
  createdAt: string;
  role: string;
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function AccountCard({ email, emailVerified, createdAt, role }: AccountCardProps) {
  return (
    <SectionCard title="Account">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <IconBox>
            <MailIcon className="size-5" />
          </IconBox>
          <div className="min-w-0">
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Email</p>
            <p className="text-sm text-text-body mt-0.5 truncate">{email}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <IconBox>
            <BadgeCheckIcon className="size-5" />
          </IconBox>
          <div>
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Verified</p>
            <p className="text-sm mt-0.5">
              {emailVerified ? (
                <span className="text-success">Verified</span>
              ) : (
                <span className="text-warning">Not verified</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <IconBox>
            <CalendarIcon className="size-5" />
          </IconBox>
          <div>
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
              Member Since
            </p>
            <p className="text-sm text-text-body mt-0.5">{formatDate(createdAt)}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <IconBox>
            <UserIcon className="size-5" />
          </IconBox>
          <div>
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Role</p>
            <p className="text-sm text-text-body mt-0.5 capitalize">{role}</p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
