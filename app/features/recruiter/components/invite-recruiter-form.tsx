"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  RecruiterInviteSchema,
  RecruiterBulkInviteFormSchema,
  type RecruiterInviteInput,
  type RecruiterBulkInviteFormInput,
} from "@/app/features/recruiter/schema/team.schema";
import { inviteRecruiter } from "@/app/features/recruiter/actions/invite-recruiter";
import {
  bulkInviteRecruiters,
  type BulkInviteResult,
} from "@/app/features/recruiter/actions/bulk-invite-recruiters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Users, Mail } from "lucide-react";

type Tab = "single" | "bulk";

export function InviteRecruiterForm() {
  const [tab, setTab] = useState<Tab>("single");
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [bulkResult, setBulkResult] = useState<BulkInviteResult | null>(null);

  const singleForm = useForm<RecruiterInviteInput>({
    resolver: zodResolver(RecruiterInviteSchema),
  });

  const bulkForm = useForm<RecruiterBulkInviteFormInput>({
    resolver: zodResolver(RecruiterBulkInviteFormSchema),
    defaultValues: {
      emailsRaw: "",
    },
  });

  const onSubmitSingle = async (data: RecruiterInviteInput) => {
    setServerError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.set("email", data.email);

    try {
      const result = await inviteRecruiter(formData);
      if (result.success) {
        setSuccess(true);
        singleForm.reset();
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Failed to send invitation");
    }
  };

  const onSubmitBulk = async (data: RecruiterBulkInviteFormInput) => {
    setServerError(null);
    setBulkResult(null);

    const formData = new FormData();
    formData.set("emails", data.emailsRaw);

    try {
      const result = await bulkInviteRecruiters(formData);
      setBulkResult(result);
      if (result.sent > 0) {
        bulkForm.reset();
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Failed to send invitations");
    }
  };

  const rawEmails =
    useWatch({
      control: bulkForm.control,
      name: "emailsRaw",
    }) ?? "";
  const parsedEmails = rawEmails
    .split(/[,;\s]+/)
    .map((e: string) => e.trim())
    .filter((e: string) => e.length > 0);

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-xl bg-bg-elevated p-1 w-fit border border-border-subtle">
        <button
          type="button"
          onClick={() => {
            setTab("single");
            setServerError(null);
            setBulkResult(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            tab === "single"
              ? "bg-bg-surface text-text-heading shadow-sm border border-border-subtle"
              : "text-text-muted hover:text-text-heading hover:bg-bg-surface/50"
          }`}
        >
          <Mail className="size-4" />
          Single
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("bulk");
            setServerError(null);
            setSuccess(false);
          }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            tab === "bulk"
              ? "bg-bg-surface text-text-heading shadow-sm border border-border-subtle"
              : "text-text-muted hover:text-text-heading hover:bg-bg-surface/50"
          }`}
        >
          <Users className="size-4" />
          Bulk
        </button>
      </div>

      {tab === "single" && (
        <form onSubmit={singleForm.handleSubmit(onSubmitSingle)} className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1 space-y-1 min-w-0">
              <label htmlFor="invite-email" className="text-sm font-medium text-text-heading">
                Invite team member by email
              </label>
              <Input
                id="invite-email"
                type="email"
                placeholder="email@example.com"
                {...singleForm.register("email")}
              />
              {singleForm.formState.errors.email && (
                <p className="text-xs text-error">{singleForm.formState.errors.email.message}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={singleForm.formState.isSubmitting}
              className="sm:w-auto"
            >
              <UserPlus className="size-4" />
              {singleForm.formState.isSubmitting ? "Sending..." : "Send Invite"}
            </Button>
          </div>
        </form>
      )}

      {tab === "bulk" && (
        <form onSubmit={bulkForm.handleSubmit(onSubmitBulk)} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="invite-emails" className="text-sm font-medium text-text-heading">
              Invite multiple team members
            </label>
            <Textarea
              id="invite-emails"
              placeholder="alice@example.com, bob@example.com, carol@example.com"
              className="min-h-24"
              {...bulkForm.register("emailsRaw")}
            />
            <p className="text-xs text-text-muted">
              Separate emails with commas, semicolons, spaces, or new lines. Max 50 emails.
            </p>
            {parsedEmails.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {parsedEmails.map((email: string, i: number) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                  >
                    {email}
                  </span>
                ))}
              </div>
            )}
            {bulkForm.formState.errors.emailsRaw && (
              <p className="text-xs text-error">{bulkForm.formState.errors.emailsRaw.message}</p>
            )}
          </div>
          <Button type="submit" disabled={bulkForm.formState.isSubmitting}>
            <Users className="size-4" />
            {bulkForm.formState.isSubmitting
              ? "Sending..."
              : `Send Invites (${parsedEmails.length})`}
          </Button>
        </form>
      )}

      {success && tab === "single" && (
        <p className="text-sm text-success">Invitation sent successfully.</p>
      )}

      {bulkResult && tab === "bulk" && (
        <div className="space-y-2 text-sm">
          {bulkResult.sent > 0 && (
            <p className="text-success">{bulkResult.sent} invitation(s) sent successfully.</p>
          )}
          {bulkResult.skipped.length > 0 && (
            <div>
              <p className="text-text-muted">Skipped ({bulkResult.skipped.length}):</p>
              <ul className="list-disc list-inside text-xs text-text-muted space-y-0.5">
                {bulkResult.skipped.map((s, i) => (
                  <li key={i}>
                    {s.email} &mdash; {s.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {bulkResult.errors.length > 0 && (
            <div>
              <p className="text-error">Errors ({bulkResult.errors.length}):</p>
              <ul className="list-disc list-inside text-xs text-error space-y-0.5">
                {bulkResult.errors.map((e, i) => (
                  <li key={i}>
                    {e.email} &mdash; {e.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {serverError && <p className="text-sm text-error">{serverError}</p>}
    </div>
  );
}
