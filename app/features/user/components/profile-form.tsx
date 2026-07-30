"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";
import { ProfileSchema, type ProfileInput } from "@/app/features/user/schema/profile.schema";
import { upsertProfile } from "@/app/features/user/actions/upsert-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ExperienceListEditor } from "./experience-list-editor";
import { SocialLinksEditor } from "./social-links-editor";
import { SkillInput } from "@/components/ui/skill-input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  UserIcon,
  FileText,
  MapPin,
  Wrench,
  DollarSign,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSavingAndLeaving, setIsSavingAndLeaving] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const pendingHref = useRef<string | null>(null);

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

  const isDirty = form.formState.isDirty;
  const skills = useWatch({
    control: form.control,
    name: "skills",
  });

  const showConfirmDialogRef = useRef(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Intercept in-app link navigation when the form has unsaved changes
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!isDirty) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const link = target.closest("a");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href === "") return;

      let absoluteHref: string;
      if (href.startsWith("/")) {
        absoluteHref = href.split("#")[0].split("?")[0];
      } else if (href.startsWith("http") || href.startsWith("//")) {
        try {
          const url = new URL(href, window.location.origin);
          if (url.origin !== window.location.origin) return;
          absoluteHref = url.pathname;
        } catch {
          return;
        }
      } else {
        return;
      }

      if (absoluteHref === pathname) return;

      e.preventDefault();
      e.stopPropagation();
      pendingHref.current = absoluteHref;
      showConfirmDialogRef.current = true;
      setShowConfirmDialog(true);
    };

    const handlePopState = () => {
      if (!isDirty) return;

      let target = window.location.pathname;
      try {
        const url = new URL(window.location.href, window.location.origin);
        target = url.pathname;
      } catch {
        // keep raw value
      }

      pendingHref.current = target;
      showConfirmDialogRef.current = true;
      setShowConfirmDialog(true);
    };

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isDirty, pathname]);

  const handleSave = async () => {
    setServerError(null);
    setSuccess(false);
    try {
      const result = await upsertProfile(form.getValues());
      if (result.success) {
        setSuccess(true);
        form.reset(form.getValues());
        // form.reset() automatically resets form.formState.isDirty to false
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Failed to save profile");
    }
  };

  const onSubmit = async () => {
    await handleSave();
  };

  return (
    <>
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
            {form.formState.errors.bio && (
              <p className="text-xs text-error">{form.formState.errors.bio.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="location" className="text-sm font-medium text-text-heading">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted pointer-events-none" />
                <Input
                  id="location"
                  placeholder="San Francisco, CA"
                  className="pl-9"
                  {...form.register("location")}
                />
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
              value={skills ?? []}
              onChange={(skills) => form.setValue("skills", skills, { shouldValidate: true })}
              disabled={form.formState.isSubmitting}
            />
            {form.formState.errors.skills && (
              <p className="text-xs text-error">{form.formState.errors.skills.message}</p>
            )}
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
            disabled={!isDirty || form.formState.isSubmitting}
            variant="default"
            size="default"
            className={cn("w-full sm:w-auto transition-opacity", !isDirty && "opacity-40 cursor-not-allowed")}
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

      {/* Confirmation dialog for unsaved changes */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Do you want to save them before leaving?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => {
                showConfirmDialogRef.current = false;
                pendingHref.current = null;
                setShowConfirmDialog(false);
              }}
              className="px-4 py-2 rounded-md border border-border-subtle bg-bg-surface hover:bg-bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                showConfirmDialogRef.current = false;
                setShowConfirmDialog(false);
                if (pendingHref.current) {
                  const target = pendingHref.current;
                  pendingHref.current = null;
                  await router.push(target);
                }
              }}
              className="px-4 py-2 rounded-md border border-border-subtle bg-bg-surface hover:bg-bg-muted"
            >
              Discard and Leave
            </button>
            <button
              onClick={async () => {
                setIsSavingAndLeaving(true);
                try {
                  await handleSave();
                  if (serverError) return;
                  showConfirmDialogRef.current = false;
                  setShowConfirmDialog(false);
                  if (pendingHref.current) {
                    const target = pendingHref.current;
                    pendingHref.current = null;
                    await router.push(target);
                  }
                } finally {
                  setIsSavingAndLeaving(false);
                }
              }}
              disabled={isSavingAndLeaving}
              className="px-4 py-2 rounded-md bg-brand text-brand-foreground hover:bg-brand/90 disabled:opacity-70"
            >
              {isSavingAndLeaving ? "Saving..." : "Save and Leave"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}