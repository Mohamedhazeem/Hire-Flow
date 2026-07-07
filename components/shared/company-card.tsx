import Link from "next/link";
import Image from "next/image";
import { Building2Icon, ShieldCheckIcon } from "lucide-react";
import { SectionCard } from "@/components/shared/section-card";
import { IconBox } from "@/components/shared/icon-box";

type CompanyCardProps = {
  companyId: string;
  companyName: string;
  companyLogo: string | null;
  memberRole: string;
};

export function CompanyCard({ companyId, companyName, companyLogo, memberRole }: CompanyCardProps) {
  return (
    <SectionCard title="Company">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {companyLogo ? (
            <Image
              src={companyLogo}
              alt={companyName}
              width={40}
              height={40}
              className="rounded-lg object-contain size-10 shrink-0"
            />
          ) : (
            <IconBox>
              <Building2Icon className="size-5" />
            </IconBox>
          )}
          <div className="min-w-0">
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Company</p>
            <Link
              href={`/admin/company/${companyId}`}
              className="text-sm font-medium text-text-heading hover:text-brand truncate block mt-0.5"
            >
              {companyName}
            </Link>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <IconBox>
            <ShieldCheckIcon className="size-5" />
          </IconBox>
          <div>
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Member Role</p>
            <p className="text-sm text-text-body mt-0.5 capitalize">{memberRole}</p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
