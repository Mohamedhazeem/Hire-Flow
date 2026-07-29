"use client";

import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Plus, Trash2, Link } from "lucide-react";
import type { ProfileInput } from "@/app/features/user/schema/profile.schema";

type Props = {
  form: UseFormReturn<ProfileInput>;
};

const PLATFORMS = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "github", label: "GitHub" },
  { value: "portfolio", label: "Portfolio" },
  { value: "other", label: "Other" },
] as const;

const emptyLink = { platform: "linkedin" as const, url: "", label: "" };

export function SocialLinksEditor({ form }: Props) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "socialLinks",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-heading flex items-center gap-1.5">
          <Link className="size-4" />
          Social Links
        </span>
        <Button type="button" variant="outline" size="sm" onClick={() => append(emptyLink)} className="gap-1">
          <Plus className="size-3.5" />
          Add
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-text-muted py-2">
          No links added yet. Share your LinkedIn, GitHub, portfolio, or other profiles.
        </p>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-2 rounded-lg border border-border-subtle bg-bg-elevated p-3"
          >
            <select
              {...form.register(`socialLinks.${index}.platform`)}
              className="h-9 rounded-md border border-border-subtle bg-bg-surface px-2 text-sm text-text-body focus:outline-none focus:ring-2 focus:ring-brand w-full sm:w-32"
            >
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <Input placeholder="https://..." className="flex-1 w-full" {...form.register(`socialLinks.${index}.url`)} />
            <Input
              placeholder="Label (optional)"
              className="w-full sm:w-28"
              {...form.register(`socialLinks.${index}.label`)}
            />
            <button
              type="button"
              onClick={() => remove(index)}
              className="shrink-0 text-text-muted hover:text-error transition-colors size-9 flex items-center justify-center"
              aria-label="Remove link"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
