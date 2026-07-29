"use client";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ColumnDef } from "@/components/ui/data-table";
import type { ApplicantRow } from "@/app/features/recruiter/queries/application-queries";
import {
  EyeIcon,
  PlayIcon,
  UserPlusIcon,
  CheckCircle2Icon,
  CalendarIcon,
  SendIcon,
  UserCheckIcon,
  XCircleIcon,
  MessageSquareTextIcon,
  Undo2Icon,
} from "lucide-react";

type ApplicantTableColumnsProps = {
  recruiterId: string;
  onViewDetails: (applicantId: string) => void;
  onNavigateToMessages: (threadId: string) => void;
  onDialog: (type: string, applicant: ApplicantRow) => void;
  onRevert: (applicant: ApplicantRow) => void;
  actionedIds: Set<string>;
};

export function createApplicantTableColumns({
  recruiterId,
  onViewDetails,
  onNavigateToMessages,
  onDialog,
  onRevert,
  actionedIds,
}: ApplicantTableColumnsProps): ColumnDef<ApplicantRow>[] {
  return [
    {
      key: "name",
      header: "Name",
      cell: (row) => <span className="font-medium text-text-heading max-w-xs truncate block">{row.name}</span>,
    },
    {
      key: "email",
      header: "Email",
      cell: (row) => <span className="text-text-body text-sm">{row.email}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "appliedAt",
      header: "Applied",
      cell: (row) => (
        <span className="text-text-muted text-xs whitespace-nowrap">
          {new Date(row.appliedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (row) => {
        const threadId = recruiterId && row.userId ? [recruiterId, row.userId].sort().join("_") : null;
        const isActioned = actionedIds.has(row.id);

        function actionBtn(icon: React.ReactNode, title: string, onClick: () => void) {
          return (
            <Button variant="ghost" size="icon-sm" title={title} onClick={onClick}>
              {icon}
            </Button>
          );
        }

        return (
          <div className="flex items-center justify-end gap-1">
            {actionBtn(<EyeIcon className="size-4 text-text-muted hover:text-brand" />, "View Details", () =>
              onViewDetails(row.id),
            )}
            {threadId &&
              actionBtn(<MessageSquareTextIcon className="size-4 text-text-muted hover:text-brand" />, "Message", () =>
                onNavigateToMessages(threadId),
              )}
            {isActioned ? (
              actionBtn(<Undo2Icon className="size-4 text-warning" />, "Revert", () => onRevert(row))
            ) : (
              <>
                {row.status === "applied" &&
                  actionBtn(<UserPlusIcon className="size-4 text-accent" />, "Invite", () => onDialog("invite", row))}
                {row.status === "applied" &&
                  actionBtn(<PlayIcon className="size-4 text-accent" />, "Start Review", () => onDialog("review", row))}
                {row.status === "reviewing" &&
                  actionBtn(<CheckCircle2Icon className="size-4 text-accent" />, "Shortlist", () =>
                    onDialog("shortlist", row),
                  )}
                {row.status === "shortlisted" &&
                  actionBtn(<CalendarIcon className="size-4 text-warning" />, "Schedule Interview", () =>
                    onDialog("schedule_interview", row),
                  )}
                {row.status === "interview_scheduled" &&
                  actionBtn(<SendIcon className="size-4 text-success" />, "Send Offer", () =>
                    onDialog("send_offer", row),
                  )}
                {row.status === "offered" &&
                  actionBtn(<UserCheckIcon className="size-4 text-success" />, "Mark Hired", () =>
                    onDialog("hire", row),
                  )}
                {row.status !== "hired" &&
                  row.status !== "rejected" &&
                  actionBtn(<XCircleIcon className="size-4 text-destructive" />, "Reject", () =>
                    onDialog("reject", row),
                  )}
              </>
            )}
          </div>
        );
      },
    },
  ];
}
