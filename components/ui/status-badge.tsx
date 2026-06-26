import { cn } from "@/lib/utils";

type ApplicationStatus =
  | "applied"
  | "reviewing"
  | "shortlisted"
  | "interview_scheduled"
  | "offered"
  | "hired"
  | "rejected";

type StatusConfig = {
  label: string;
  className: string;
};

const STATUS_MAP: Record<ApplicationStatus, StatusConfig> = {
  applied: {
    label: "Applied",
    className: "bg-brand/10 text-brand border-brand/20",
  },
  reviewing: {
    label: "Reviewing",
    className: "bg-info/10 text-info border-info/20",
  },
  shortlisted: {
    label: "Shortlisted",
    className: "bg-accent/10 text-accent border-accent/20",
  },
  interview_scheduled: {
    label: "Interview",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  offered: {
    label: "Offered",
    className: "bg-success/10 text-success border-success/20",
  },
  hired: {
    label: "Hired",
    className: "bg-success/20 text-success border-success/30",
  },
  rejected: {
    label: "Rejected",
    className: "bg-error/10 text-error border-error/20",
  },
};

type StatusBadgeProps = {
  status: string;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_MAP[status as ApplicationStatus] ?? {
    label: status,
    className: "bg-muted text-text-muted border-border",
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
