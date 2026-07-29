"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminInviteSchema, type AdminInviteInput } from "@/app/features/admin/schema/admin.schema";
import { inviteAdmin } from "@/app/features/admin/actions/invite-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus } from "lucide-react";

export function InviteSingleForm() {
  const [success, setSuccess] = useState(false);
  const form = useForm<AdminInviteInput>({ resolver: zodResolver(AdminInviteSchema) });

  const onSubmit = async (data: AdminInviteInput) => {
    const formData = new FormData();
    formData.set("email", data.email);

    try {
      const result = await inviteAdmin(formData);
      if (result.success) {
        setSuccess(true);
        form.reset();
      }
    } catch (err) {
      form.setError("email", {
        message: err instanceof Error ? err.message : "Failed to send invitation",
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1 space-y-1 min-w-0">
          <label htmlFor="invite-email" className="text-sm font-medium text-text-heading">
            Invite admin by email
          </label>
          <Input id="invite-email" type="email" placeholder="email@example.com" {...form.register("email")} />
          {form.formState.errors.email && <p className="text-xs text-error">{form.formState.errors.email.message}</p>}
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting} className="sm:w-auto">
          <UserPlus className="size-4" />
          {form.formState.isSubmitting ? "Sending..." : "Send Invite"}
        </Button>
      </div>
      {success && <p className="text-sm text-success">Invitation sent successfully.</p>}
    </form>
  );
}
