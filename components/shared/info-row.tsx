import type { ReactNode } from "react";
import { IconBox } from "@/components/shared/icon-box";

type InfoRowProps = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
};

export function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <IconBox size="sm">{icon}</IconBox>
      <div>
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">{label}</p>
        <div className="text-sm text-text-body mt-0.5">{value}</div>
      </div>
    </div>
  );
}
