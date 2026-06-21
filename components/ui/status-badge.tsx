import { cn } from "@/lib/utils";

// Must stay in sync with the ApplicationStatus enum in prisma/schema.prisma
type ApplicationStatus = "applied" | "viewed" | "rejected" | "accepted";

type StatusConfig = {
  label: string;
  className: string;
};

const STATUS_MAP: Record<ApplicationStatus, StatusConfig> = {
  applied: {
    label: "Applied",
    // brand-subtle bg, brand text
    className: "bg-brand/10 text-brand border-brand/20",
  },
  viewed: {
    label: "Viewed",
    // info tokens
    className: "bg-info/10 text-info border-info/20",
  },
  rejected: {
    label: "Rejected",
    // error tokens
    className: "bg-error/10 text-error border-error/20",
  },
  accepted: {
    label: "Accepted",
    // success tokens
    className: "bg-success/10 text-success border-success/20",
  },
};

type StatusBadgeProps = {
  status: ApplicationStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_MAP[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-radius-full border px-2.5 py-0.5 text-xs font-semibold",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
