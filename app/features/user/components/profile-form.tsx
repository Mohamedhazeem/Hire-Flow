"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileSchema, type ProfileInput } from "@/app/features/user/schema/profile.schema";
import { upsertProfile } from "@/app/features/user/actions/upsert-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ExperienceListEditor } from "./experience-list-editor";
import { SocialLinksEditor } from "./social-links-editor";
import { SkillInput } from "@/components/ui/skill-input";
import { UserIcon, FileText, MapPin, Wrench, DollarSign, CheckCircle2, AlertCircle } from "lucide-react";

const WORK_MODE_OPTIONS = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
] as const;

type Props = {
  defaultValues?: ProfileInput;
};

export function ProfileForm({ defaultValues }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(false), 3000);
    return () => clearTimeout(timer);
  }, [success]);

  const form = useForm<ProfileInput>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: defaultValues ?? {
      headline: "",
      bio: "",
      location: "",
      skills: [],
      workMode: null,
      basePay: null,
      ctc: null,
      ectc: null,
      experiences: [],
      socialLinks: [],
    },
  });

  const onSubmit = async (data: ProfileInput) => {
    setServerError(null);
    setSuccess(false);
    try {
      const result = await upsertProfile(data);
      if (result.success) {
        setSuccess(true);
        form.reset(data);
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Failed to save profile");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-3xl space-y-6">
      <div className="rounded-xl border border-border-subtle bg-bg-surface p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <label htmlFor="headline" className="text-sm font-medium text-text-heading">
            Headline
          </label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted pointer-events-none" />
            <Input
              id="headline"
              placeholder="Senior Frontend Engineer"
              className="pl-9"
              {...form.register("headline")}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="bio" className="text-sm font-medium text-text-heading">
            Bio
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 size-4 text-text-muted pointer-events-none" />
            <Textarea
              id="bio"
              placeholder="Tell employers about yourself..."
              rows={4}
              className="min-h-24 resize-y pl-9"
              {...form.register("bio")}
            />
          </div>
          {form.formState.errors.bio && <p className="text-xs text-error">{form.formState.errors.bio.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="location" className="text-sm font-medium text-text-heading">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted pointer-events-none" />
              <Input id="location" placeholder="San Francisco, CA" className="pl-9" {...form.register("location")} />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="workMode" className="text-sm font-medium text-text-heading">
              Work Mode
            </label>
            <select
              id="workMode"
              {...form.register("workMode")}
              className="h-9 w-full rounded-md border border-border-subtle bg-bg-surface px-3 text-sm text-text-body focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">Prefer not to say</option>
              {WORK_MODE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-text-heading flex items-center gap-1.5">
            <Wrench className="size-4" />
            Skills
          </label>
          <SkillInput
            value={form.watch("skills") ?? []}
            onChange={(skills) => form.setValue("skills", skills, { shouldValidate: true })}
            disabled={form.formState.isSubmitting}
          />
          {form.formState.errors.skills && <p className="text-xs text-error">{form.formState.errors.skills.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-text-heading flex items-center gap-1.5">
            <DollarSign className="size-4" />
            Pay Expectations (USD)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-text-muted">Base Pay</label>
              <Input type="number" min={0} placeholder="120000" {...form.register("basePay")} />
            </div>
            <div>
              <label className="text-xs text-text-muted">Current CTC</label>
              <Input type="number" min={0} placeholder="150000" {...form.register("ctc")} />
            </div>
            <div>
              <label className="text-xs text-text-muted">Expected CTC</label>
              <Input type="number" min={0} placeholder="180000" {...form.register("ectc")} />
            </div>
          </div>
          {form.formState.errors.basePay && (
            <p className="text-xs text-error">{form.formState.errors.basePay.message}</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border-subtle bg-bg-surface p-6 sm:p-8">
        <ExperienceListEditor form={form} />
      </div>

      <div className="rounded-xl border border-border-subtle bg-bg-surface p-6 sm:p-8">
        <SocialLinksEditor form={form} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          variant="default"
          size="default"
          className="w-full sm:w-auto"
        >
          {form.formState.isSubmitting ? "Saving..." : "Save profile"}
        </Button>

        {success && (
          <p className="text-sm text-success flex items-center gap-1.5">
            <CheckCircle2 className="size-4" />
            Profile saved successfully
          </p>
        )}

        {serverError && (
          <p className="text-sm text-error flex items-center gap-1.5">
            <AlertCircle className="size-4" />
            {serverError}
          </p>
        )}
      </div>
    </form>
  );
}
