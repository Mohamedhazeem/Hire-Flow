"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

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
import { Loader2Icon, MailIcon } from "lucide-react";
import { useTransitionStatus } from "@/app/features/recruiter/hooks/use-applications";
import type { ApplicantRow } from "@/app/features/recruiter/queries/application-queries";

// ─── Shared email toggle ─────────────────────────────────────────────────────

function EmailCheckbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-text-body cursor-pointer select-none pt-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-brand"
      />
      <MailIcon className="size-4 text-text-muted" />
      <span>Also send email notification</span>
    </label>
  );
}

// ─── Confirmation (Review + Shortlist) ──────────────────────────────────────

type ConfirmStatusDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicant: ApplicantRow | null;
};

export function ReviewDialog({ open, onOpenChange, applicant }: ConfirmStatusDialogProps) {
  const transitionStatus = useTransitionStatus();
  const [sendEmail, setSendEmail] = useState(false);

  const handleConfirm = () => {
    if (!applicant) return;
    transitionStatus.mutate(
      {
        applicationId: applicant.id,
        data: {
          status: "reviewing",
          updatedAt: applicant.updatedAt.toISOString(),
          email: sendEmail,
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
            Mark {applicant?.name ?? "this applicant"} as &quot;Reviewing&quot;. They will be
            notified in-app.
          </DialogDescription>
        </DialogHeader>
        <EmailCheckbox checked={sendEmail} onChange={setSendEmail} />
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
  const [sendEmail, setSendEmail] = useState(false);

  const handleConfirm = () => {
    if (!applicant) return;
    transitionStatus.mutate(
      {
        applicationId: applicant.id,
        data: {
          status: "shortlisted",
          updatedAt: applicant.updatedAt.toISOString(),
          email: sendEmail,
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
            Move {applicant?.name ?? "this applicant"} to the shortlist. They will be notified
            in-app.
          </DialogDescription>
        </DialogHeader>
        <EmailCheckbox checked={sendEmail} onChange={setSendEmail} />
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

const TOMORROW_DEFAULT = formatDateForInput(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());

type InterviewFormData = {
  interviewDate: string;
  meetingLink: string;
  email: boolean;
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
      interviewDate: TOMORROW_DEFAULT,
      meetingLink: "",
      email: false,
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
          email: data.email,
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
          <label className="flex items-center gap-2 text-sm text-text-body cursor-pointer select-none">
            <input type="checkbox" className="size-4 accent-brand" {...register("email")} />
            <MailIcon className="size-4 text-text-muted" />
            <span>Also send email notification</span>
          </label>
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
  email: boolean;
};

export function SendOfferDialog({ open, onOpenChange, applicant }: SendOfferDialogProps) {
  const transitionStatus = useTransitionStatus();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OfferFormData>({
    defaultValues: { email: false },
  });

  const onSubmit = (data: OfferFormData) => {
    if (!applicant) return;
    transitionStatus.mutate(
      {
        applicationId: applicant.id,
        data: {
          status: "offered",
          offerDetails: data.offerDetails,
          updatedAt: applicant.updatedAt.toISOString(),
          email: data.email,
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
          <label className="flex items-center gap-2 text-sm text-text-body cursor-pointer select-none">
            <input type="checkbox" className="size-4 accent-brand" {...register("email")} />
            <MailIcon className="size-4 text-text-muted" />
            <span>Also send email notification</span>
          </label>
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

// ─── Hire Dialog ─────────────────────────────────────────────────────────────

export function HireDialog({ open, onOpenChange, applicant }: ConfirmStatusDialogProps) {
  const transitionStatus = useTransitionStatus();
  const [sendEmail, setSendEmail] = useState(false);

  const handleConfirm = () => {
    if (!applicant) return;
    transitionStatus.mutate(
      {
        applicationId: applicant.id,
        data: {
          status: "hired",
          updatedAt: applicant.updatedAt.toISOString(),
          email: sendEmail,
        },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark as Hired</DialogTitle>
          <DialogDescription>
            Confirm that {applicant?.name ?? "this applicant"} has been hired. They will be
            notified in-app.
          </DialogDescription>
        </DialogHeader>
        <EmailCheckbox checked={sendEmail} onChange={setSendEmail} />
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={transitionStatus.isPending}>
            {transitionStatus.isPending && <Loader2Icon className="size-4 animate-spin" />}
            Mark as Hired
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Invite Dialog ───────────────────────────────────────────────────────────

export function InviteDialog({ open, onOpenChange, applicant }: ConfirmStatusDialogProps) {
  const transitionStatus = useTransitionStatus();
  const [sendEmail, setSendEmail] = useState(false);

  const handleConfirm = () => {
    if (!applicant) return;
    transitionStatus.mutate(
      {
        applicationId: applicant.id,
        data: {
          status: "invited",
          updatedAt: applicant.updatedAt.toISOString(),
          email: sendEmail,
        },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Applicant</DialogTitle>
          <DialogDescription>
            Invite {applicant?.name ?? "this applicant"} to the next stage. They will be notified
            in-app.
          </DialogDescription>
        </DialogHeader>
        <EmailCheckbox checked={sendEmail} onChange={setSendEmail} />
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={transitionStatus.isPending}>
            {transitionStatus.isPending && <Loader2Icon className="size-4 animate-spin" />}
            Invite
          </Button>
        </div>
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
  email: boolean;
};

export function RejectDialog({ open, onOpenChange, applicant }: RejectDialogProps) {
  const transitionStatus = useTransitionStatus();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RejectFormData>({
    defaultValues: { email: false },
  });

  const onSubmit = (data: RejectFormData) => {
    if (!applicant) return;
    transitionStatus.mutate(
      {
        applicationId: applicant.id,
        data: {
          status: "rejected",
          rejectionReason: data.rejectionReason,
          updatedAt: applicant.updatedAt.toISOString(),
          email: data.email,
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
          <label className="flex items-center gap-2 text-sm text-text-body cursor-pointer select-none">
            <input type="checkbox" className="size-4 accent-brand" {...register("email")} />
            <MailIcon className="size-4 text-text-muted" />
            <span>Also send email notification</span>
          </label>
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
