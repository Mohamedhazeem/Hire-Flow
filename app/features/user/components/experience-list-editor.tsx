"use client";

import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Briefcase } from "lucide-react";
import { useState } from "react";
import type { ProfileInput } from "@/app/features/user/schema/profile.schema";

type Props = {
  form: UseFormReturn<ProfileInput>;
};

const emptyExperience = {
  company: "",
  title: "",
  startDate: "",
  endDate: null,
  description: "",
};

export function ExperienceListEditor({ form }: Props) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "experiences",
  });

  const [presentIndex, setPresentIndex] = useState<Set<number>>(new Set());

  const togglePresent = (index: number) => {
    const next = new Set(presentIndex);
    if (next.has(index)) {
      next.delete(index);
      form.setValue(`experiences.${index}.endDate`, null);
    } else {
      next.add(index);
      form.setValue(`experiences.${index}.endDate`, null);
    }
    setPresentIndex(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-heading flex items-center gap-1.5">
          <Briefcase className="size-4" />
          Experience
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(emptyExperience)}
          className="gap-1"
        >
          <Plus className="size-3.5" />
          Add
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-text-muted py-2">
          No experience added yet. Click "Add" to include your work history.
        </p>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-lg border border-border-subtle bg-bg-elevated p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                #{index + 1}
              </span>
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-text-muted hover:text-error transition-colors"
                aria-label="Remove experience"
              >
                <Trash2 className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-text-muted">Company *</label>
                <Input placeholder="Acme Inc." {...form.register(`experiences.${index}.company`)} />
                {form.formState.errors.experiences?.[index]?.company && (
                  <p className="text-xs text-error">{form.formState.errors.experiences[index]!.company?.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs text-text-muted">Title *</label>
                <Input placeholder="Software Engineer" {...form.register(`experiences.${index}.title`)} />
                {form.formState.errors.experiences?.[index]?.title && (
                  <p className="text-xs text-error">{form.formState.errors.experiences[index]!.title?.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-text-muted">Start Date *</label>
                <Input type="date" {...form.register(`experiences.${index}.startDate`)} />
                {form.formState.errors.experiences?.[index]?.startDate && (
                  <p className="text-xs text-error">{form.formState.errors.experiences[index]!.startDate?.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-text-muted">End Date</label>
                  <label className="flex items-center gap-1.5 text-xs text-text-muted cursor-pointer">
                    <input
                      type="checkbox"
                      checked={presentIndex.has(index)}
                      onChange={() => togglePresent(index)}
                      className="size-3 rounded border-border-subtle"
                    />
                    Present
                  </label>
                </div>
                {presentIndex.has(index) ? (
                  <div className="h-9 flex items-center px-3 text-sm text-text-muted border border-dashed border-border-subtle rounded-md">
                    Present
                  </div>
                ) : (
                  <Input type="date" {...form.register(`experiences.${index}.endDate`)} />
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-text-muted">Description</label>
              <Textarea
                rows={2}
                placeholder="Describe your role and achievements..."
                className="min-h-16 resize-y"
                {...form.register(`experiences.${index}.description`)}
              />
              {form.formState.errors.experiences?.[index]?.description && (
                <p className="text-xs text-error">{form.formState.errors.experiences[index]!.description?.message}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
