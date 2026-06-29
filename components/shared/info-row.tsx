import type { ReactNode } from "react";

type InfoRowProps = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
};

export function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="size-5 shrink-0 text-text-muted mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">{label}</p>
        <div className="text-sm text-text-body mt-0.5">{value}</div>
      </div>
    </div>
  );
}
