"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AdminBulkInviteFormSchema,
  type AdminBulkInviteFormInput,
} from "@/app/features/admin/schema/admin.schema";
import {
  bulkInviteAdmins,
  type BulkInviteResult,
} from "@/app/features/admin/actions/bulk-invite-admin";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Users } from "lucide-react";

export function InviteBulkForm() {
  const [result, setResult] = useState<BulkInviteResult | null>(null);
  const form = useForm<AdminBulkInviteFormInput>({
    resolver: zodResolver(AdminBulkInviteFormSchema),
    defaultValues: { emailsRaw: "" },
  });

  const rawEmails = useWatch({ control: form.control, name: "emailsRaw" }) ?? "";
  const parsedEmails = rawEmails
    .split(/[,;\s]+/)
    .map((e: string) => e.trim())
    .filter((e: string) => e.length > 0);

  const onSubmit = async (data: AdminBulkInviteFormInput) => {
    setResult(null);
    const formData = new FormData();
    formData.set("emails", data.emailsRaw);

    try {
      const r = await bulkInviteAdmins(formData);
      setResult(r);
      if (r.sent > 0) form.reset();
    } catch (err) {
      form.setError("emailsRaw", {
        message: err instanceof Error ? err.message : "Failed to send invitations",
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="invite-emails" className="text-sm font-medium text-text-heading">
          Invite multiple admins
        </label>
        <Textarea
          id="invite-emails"
          placeholder="alice@example.com, bob@example.com, carol@example.com"
          className="min-h-24"
          {...form.register("emailsRaw")}
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
        {form.formState.errors.emailsRaw && (
          <p className="text-xs text-error">{form.formState.errors.emailsRaw.message}</p>
        )}
      </div>
      <Button type="submit" disabled={form.formState.isSubmitting}>
        <Users className="size-4" />
        {form.formState.isSubmitting ? "Sending..." : `Send Invites (${parsedEmails.length})`}
      </Button>

      {result && (
        <div className="space-y-2 text-sm">
          {result.sent > 0 && (
            <p className="text-success">{result.sent} invitation(s) sent successfully.</p>
          )}
          {result.skipped.length > 0 && (
            <div>
              <p className="text-text-muted">Skipped ({result.skipped.length}):</p>
              <ul className="list-disc list-inside text-xs text-text-muted space-y-0.5">
                {result.skipped.map((s, i) => (
                  <li key={i}>
                    {s.email} &mdash; {s.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.errors.length > 0 && (
            <div>
              <p className="text-error">Errors ({result.errors.length}):</p>
              <ul className="list-disc list-inside text-xs text-error space-y-0.5">
                {result.errors.map((e, i) => (
                  <li key={i}>
                    {e.email} &mdash; {e.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
