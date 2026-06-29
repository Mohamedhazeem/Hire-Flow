"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2Icon, XCircleIcon, XIcon } from "lucide-react";

type FeedbackProps = {
  feedback: { type: "success" | "error"; message: string } | null;
  onDismiss: () => void;
};

export function ApplicantTableFeedback({ feedback, onDismiss }: FeedbackProps) {
  if (!feedback) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-xl px-4 py-2.5 text-sm",
        feedback.type === "success" && "bg-success/10 text-success border border-success/20",
        feedback.type === "error" && "bg-error/10 text-error border border-error/20",
      )}
    >
      <span className="flex items-center gap-2">
        {feedback.type === "success" && <CheckCircle2Icon className="size-4" />}
        {feedback.type === "error" && <XCircleIcon className="size-4" />}
        {feedback.message}
      </span>
      <Button variant="ghost" size="icon-sm" onClick={onDismiss}>
        <XIcon className="size-3" />
      </Button>
    </div>
  );
}
