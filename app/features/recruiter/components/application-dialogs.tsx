"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatusTransitionInput } from "@/app/features/recruiter/schema/application.schema";
import { useTransitionStatus } from "@/app/features/recruiter/hooks/use-applications";
import type { ApplicantRow } from "@/app/features/recruiter/queries/application-queries";

// ─── Confirmation (Review + Shortlist) ──────────────────────────────────────

type ConfirmStatusDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicant: ApplicantRow | null;
};

export function ReviewDialog({ open, onOpenChange, applicant }: ConfirmStatusDialogProps) {
  const transitionStatus = useTransitionStatus();

  const handleConfirm = () => {
    if (!applicant) return;
    transitionStatus.mutate(
      {
        applicationId: applicant.id,
        data: {
          status: "reviewing",
          updatedAt: applicant.updatedAt.toISOString(),
        },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start Review</DialogTitle>
          <DialogDescription>
            Mark {applicant?.name ?? "this applicant"} as &quot;Reviewing&quot;. Their status
            will be updated and they will be notified.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={transitionStatus.isPending}>
            {transitionStatus.isPending && <Loader2Icon className="size-4 animate-spin" />}
            Start Review
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Shortlist Dialog ───────────────────────────────────────────────────────

export function ShortlistDialog({ open, onOpenChange, applicant }: ConfirmStatusDialogProps) {
  const transitionStatus = useTransitionStatus();

  const handleConfirm = () => {
    if (!applicant) return;
    transitionStatus.mutate(
      {
        applicationId: applicant.id,
        data: {
          status: "shortlisted",
          updatedAt: applicant.updatedAt.toISOString(),
        },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Shortlist Applicant</DialogTitle>
          <DialogDescription>
            Move {applicant?.name ?? "this applicant"} to the shortlist. They will be notified of
            the status change.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={transitionStatus.isPending}>
            {transitionStatus.isPending && <Loader2Icon className="size-4 animate-spin" />}
            Shortlist
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Schedule Interview Dialog ──────────────────────────────────────────────

type ScheduleInterviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicant: ApplicantRow | null;
};

function formatDateForInput(isoString: string): string {
  const d = new Date(isoString);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type InterviewFormData = {
  interviewDate: string;
  meetingLink: string;
};

export function ScheduleInterviewDialog({
  open,
  onOpenChange,
  applicant,
}: ScheduleInterviewDialogProps) {
  const transitionStatus = useTransitionStatus();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InterviewFormData>({
    defaultValues: {
      interviewDate: formatDateForInput(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()),
      meetingLink: "",
    },
  });

  const onSubmit = (data: InterviewFormData) => {
    if (!applicant) return;
    transitionStatus.mutate(
      {
        applicationId: applicant.id,
        data: {
          status: "interview_scheduled",
          interviewDate: new Date(data.interviewDate).toISOString(),
          meetingLink: data.meetingLink || undefined,
          updatedAt: applicant.updatedAt.toISOString(),
        },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
          <DialogDescription>
            Set the interview date and an optional meeting link for{" "}
            {applicant?.name ?? "this applicant"}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-heading mb-1">
              Interview Date & Time *
            </label>
            <Input type="datetime-local" {...register("interviewDate", { required: "Interview date is required" })} />
            {errors.interviewDate && (
              <p className="text-sm text-destructive mt-1">{errors.interviewDate.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-heading mb-1">
              Meeting Link
            </label>
            <Input
              type="url"
              {...register("meetingLink")}
              placeholder="https://meet.google.com/xxx"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={transitionStatus.isPending}>
              {transitionStatus.isPending && <Loader2Icon className="size-4 animate-spin" />}
              Schedule
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Send Offer Dialog ──────────────────────────────────────────────────────

type SendOfferDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicant: ApplicantRow | null;
};

type OfferFormData = {
  offerDetails: string;
};

export function SendOfferDialog({ open, onOpenChange, applicant }: SendOfferDialogProps) {
  const transitionStatus = useTransitionStatus();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OfferFormData>();

  const onSubmit = (data: OfferFormData) => {
    if (!applicant) return;
    transitionStatus.mutate(
      {
        applicationId: applicant.id,
        data: {
          status: "offered",
          offerDetails: data.offerDetails,
          updatedAt: applicant.updatedAt.toISOString(),
        },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Offer</DialogTitle>
          <DialogDescription>
            Enter the offer details for {applicant?.name ?? "this applicant"}. They will be notified
            of the status change.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-heading mb-1">
              Offer Details *
            </label>
            <Textarea
              {...register("offerDetails", { required: "Offer details are required" })}
              placeholder="Salary, benefits, start date, etc."
              rows={4}
            />
            {errors.offerDetails && (
              <p className="text-sm text-destructive mt-1">{errors.offerDetails.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={transitionStatus.isPending}>
              {transitionStatus.isPending && <Loader2Icon className="size-4 animate-spin" />}
              Send Offer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Reject Dialog ──────────────────────────────────────────────────────────

type RejectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicant: ApplicantRow | null;
};

type RejectFormData = {
  rejectionReason: string;
};

export function RejectDialog({ open, onOpenChange, applicant }: RejectDialogProps) {
  const transitionStatus = useTransitionStatus();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RejectFormData>();

  const onSubmit = (data: RejectFormData) => {
    if (!applicant) return;
    transitionStatus.mutate(
      {
        applicationId: applicant.id,
        data: {
          status: "rejected",
          rejectionReason: data.rejectionReason,
          updatedAt: applicant.updatedAt.toISOString(),
        },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Applicant</DialogTitle>
          <DialogDescription>
            Provide a reason for rejecting {applicant?.name ?? "this applicant"}. They will be
            notified of this decision.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-heading mb-1">
              Rejection Reason *
            </label>
            <Textarea
              {...register("rejectionReason", { required: "Rejection reason is required" })}
              placeholder="Didn't meet experience requirements, role filled, etc."
              rows={3}
            />
            {errors.rejectionReason && (
              <p className="text-sm text-destructive mt-1">{errors.rejectionReason.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={transitionStatus.isPending}>
              {transitionStatus.isPending && <Loader2Icon className="size-4 animate-spin" />}
              Reject
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
