"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BuilderResumeSchema,
  type BuilderResumeInput,
} from "@/app/features/user/schema/resume.schema";
import { saveResumeBuilder } from "@/app/features/user/actions/save-resume-builder";
import { useUpdateBuilderData } from "@/app/features/user/hooks/use-resumes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SkillInput } from "@/components/ui/skill-input";
import {
  SaveIcon,
  PlusIcon,
  Trash2Icon,
  GraduationCap,
  Briefcase,
  Wrench,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

type Props = {
  defaultValues?: BuilderResumeInput;
  resumeId?: string;
};

const emptyExperience = {
  company: "",
  title: "",
  startYear: "" as unknown as number,
  endYear: null,
  description: "",
};

const emptyEducation = {
  school: "",
  degree: "",
  field: "",
  graduationYear: "" as unknown as number,
};

export function ResumeBuilderForm({ defaultValues, resumeId }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [presentYears, setPresentYears] = useState<Set<number>>(new Set());

  const isEdit = !!resumeId;
  const updateBuilderData = useUpdateBuilderData();

  const form = useForm<BuilderResumeInput>({
    resolver: zodResolver(BuilderResumeSchema),
    defaultValues: defaultValues ?? {
      label: "",
      summary: "",
      educations: [],
      experiences: [],
      skills: [],
    },
  });

  const {
    fields: eduFields,
    append: appendEdu,
    remove: removeEdu,
  } = useFieldArray({ control: form.control, name: "educations" });

  const {
    fields: expFields,
    append: appendExp,
    remove: removeExp,
  } = useFieldArray({ control: form.control, name: "experiences" });

  const togglePresent = (index: number) => {
    const next = new Set(presentYears);
    if (next.has(index)) {
      next.delete(index);
      form.setValue(`experiences.${index}.endYear`, null);
    } else {
      next.add(index);
      form.setValue(`experiences.${index}.endYear`, null);
    }
    setPresentYears(next);
  };

  const onSubmit = async (data: BuilderResumeInput) => {
    setServerError(null);
    setSuccess(false);

    try {
      if (isEdit && resumeId) {
        await updateBuilderData.mutateAsync({ id: resumeId, data });
      } else {
        const result = await saveResumeBuilder(data);
        if (!result.success) return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/user/resumes"), 1000);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Failed to save resume");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-3xl space-y-6">
      <div className="rounded-xl border border-border-subtle bg-bg-surface p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <label htmlFor="label" className="text-sm font-medium text-text-heading">
            Resume Label <span className="text-error">*</span>
          </label>
          <Input
            id="label"
            placeholder="e.g. Software Engineer Resume"
            {...form.register("label")}
          />
          {form.formState.errors.label && (
            <p className="text-xs text-error">{form.formState.errors.label.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="summary" className="text-sm font-medium text-text-heading">
            Professional Summary
          </label>
          <Textarea
            id="summary"
            placeholder="Brief overview of your professional background..."
            rows={3}
            className="min-h-20 resize-y"
            {...form.register("summary")}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-heading flex items-center gap-1.5">
              <GraduationCap className="size-4" />
              Education
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendEdu(emptyEducation)}
              className="gap-1"
            >
              <PlusIcon className="size-3.5" />
              Add
            </Button>
          </div>
          {eduFields.length === 0 && (
            <p className="text-sm text-text-muted py-1">No education entries.</p>
          )}
          {eduFields.map((field, i) => (
            <div
              key={field.id}
              className="rounded-lg border border-border-subtle bg-bg-elevated p-3 space-y-2"
            >
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => removeEdu(i)}
                  className="text-text-muted hover:text-error transition-colors"
                  aria-label="Remove education"
                >
                  <Trash2Icon className="size-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input placeholder="School" {...form.register(`educations.${i}.school`)} />
                <Input placeholder="Degree" {...form.register(`educations.${i}.degree`)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input placeholder="Field of study" {...form.register(`educations.${i}.field`)} />
                <Input
                  type="number"
                  placeholder="Graduation year"
                  {...form.register(`educations.${i}.graduationYear`)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-heading flex items-center gap-1.5">
              <Briefcase className="size-4" />
              Experience
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendExp(emptyExperience)}
              className="gap-1"
            >
              <PlusIcon className="size-3.5" />
              Add
            </Button>
          </div>
          {expFields.length === 0 && (
            <p className="text-sm text-text-muted py-1">No experience entries.</p>
          )}
          {expFields.map((field, i) => (
            <div
              key={field.id}
              className="rounded-lg border border-border-subtle bg-bg-elevated p-3 space-y-2"
            >
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => removeExp(i)}
                  className="text-text-muted hover:text-error transition-colors"
                  aria-label="Remove experience"
                >
                  <Trash2Icon className="size-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input placeholder="Company" {...form.register(`experiences.${i}.company`)} />
                <Input placeholder="Title" {...form.register(`experiences.${i}.title`)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Start year"
                  {...form.register(`experiences.${i}.startYear`)}
                />
                <div className="flex items-center gap-2">
                  {presentYears.has(i) ? (
                    <div className="flex-1 h-9 flex items-center px-3 text-sm text-text-muted border border-dashed border-border-subtle rounded-md">
                      Present
                    </div>
                  ) : (
                    <Input
                      type="number"
                      placeholder="End year"
                      {...form.register(`experiences.${i}.endYear`)}
                    />
                  )}
                  <label className="flex items-center gap-1 text-xs text-text-muted cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={presentYears.has(i)}
                      onChange={() => togglePresent(i)}
                      className="size-3 rounded border-border-subtle"
                    />
                    Present
                  </label>
                </div>
              </div>
              <Textarea
                rows={2}
                placeholder="Description (optional)"
                className="min-h-16 resize-y"
                {...form.register(`experiences.${i}.description`)}
              />
            </div>
          ))}
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
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          variant="default"
          className="w-full sm:w-auto gap-1.5"
        >
          <SaveIcon className="size-4" />
          {form.formState.isSubmitting ? "Saving..." : isEdit ? "Update Resume" : "Save Resume"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/user/resumes")}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        {success && (
          <p className="text-sm text-success flex items-center gap-1.5">
            <CheckCircle2 className="size-4" />
            Resume saved! Redirecting...
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
