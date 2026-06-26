"use client";

import { Resolver, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { JobCreateSchema, type JobFormInput } from "@/app/features/recruiter/schema/job.schema";
import { useCreateJob, useUpdateJob } from "@/app/features/recruiter/hooks/use-recruiter-jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ArrowLeftIcon, Loader2Icon } from "lucide-react";
import Link from "next/link";

type JobFormProps = {
  mode: "create" | "edit";
  jobId?: string;
  defaultValues?: Partial<JobFormInput>;
};

const WORK_MODE_OPTIONS = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "freelance", label: "Freelance" },
];

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string")
    return value
      ? value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  return [];
}

export function JobForm({ mode, jobId, defaultValues }: JobFormProps) {
  const router = useRouter();
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<JobFormInput>({
    resolver: zodResolver(JobCreateSchema) as Resolver<JobFormInput>,
    defaultValues: {
      title: "",
      description: "",
      locations: [],
      workMode: "remote",
      employmentType: "full_time",
      timezone: "",
      skills: [],
      tags: [],
      experienceLevel: "",
      salaryMin: undefined,
      salaryMax: undefined,
      salaryCurrency: "USD",
      applicationDeadline: "",
      ...defaultValues,
    },
  });

  const workMode = useWatch({ control, name: "workMode" });
  const employmentType = useWatch({ control, name: "employmentType" });
  const locations = useWatch({ control, name: "locations" });
  const skills = useWatch({ control, name: "skills" });
  const tags = useWatch({ control, name: "tags" });
  const locationsStr = (locations as string[] | undefined)?.join(", ") ?? "";
  const skillsStr = (skills as string[] | undefined)?.join(", ") ?? "";
  const tagsStr = (tags as string[] | undefined)?.join(", ") ?? "";

  const onSubmit = async (data: JobFormInput) => {
    if (mode === "create") {
      await createJob.mutateAsync(data);
      router.push("/recruiter/jobs");
    } else if (mode === "edit" && jobId) {
      await updateJob.mutateAsync({ id: jobId, data });
      router.push(`/recruiter/jobs/${jobId}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-heading mb-1">Title *</label>
          <Input {...register("title")} placeholder="Senior Frontend Engineer" />
          {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-heading mb-1">Description *</label>
          <Textarea
            {...register("description")}
            placeholder="Describe the role, responsibilities, and qualifications..."
            rows={6}
          />
          {errors.description && (
            <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-heading mb-1">
            Locations (comma-separated) *
          </label>
          <Input
            value={locationsStr}
            onChange={(e) =>
              setValue(
                "locations",
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
                {
                  shouldValidate: true,
                },
              )
            }
            placeholder="New York, London, Remote"
          />
          {errors.locations && (
            <p className="text-sm text-destructive mt-1">
              {errors.locations.message ?? "At least one location is required"}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <label className="block text-sm font-medium text-text-heading mb-1">Work Mode *</label>
            <Select
              value={workMode}
              onValueChange={(v) =>
                setValue("workMode", v as JobFormInput["workMode"], { shouldValidate: true })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {WORK_MODE_OPTIONS.find((o) => o.value === workMode)?.label ?? workMode}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {WORK_MODE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-text-heading mb-1">
              Employment Type *
            </label>
            <Select
              value={employmentType}
              onValueChange={(v) =>
                setValue("employmentType", v as JobFormInput["employmentType"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {EMPLOYMENT_TYPE_OPTIONS.find((o) => o.value === employmentType)?.label ??
                    employmentType}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-heading mb-1">Timezone</label>
          <Input {...register("timezone")} placeholder="EST / GMT-5" />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-heading mb-1">
            Skills (comma-separated)
          </label>
          <Input
            value={skillsStr}
            onChange={(e) => setValue("skills", toArray(e.target.value), { shouldValidate: true })}
            placeholder="React, TypeScript, Node.js"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-heading mb-1">
            Tags (comma-separated)
          </label>
          <Input
            value={tagsStr}
            onChange={(e) => setValue("tags", toArray(e.target.value), { shouldValidate: true })}
            placeholder="engineering, frontend, senior"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-heading mb-1">
            Experience Level *
          </label>
          <Input {...register("experienceLevel")} placeholder="Senior, Lead, 5+ years" />
          {errors.experienceLevel && (
            <p className="text-sm text-destructive mt-1">{errors.experienceLevel.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <label className="block text-sm font-medium text-text-heading mb-1">Salary Min</label>
            <Input
              type="number"
              {...register("salaryMin", { valueAsNumber: true })}
              placeholder="80000"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-text-heading mb-1">Salary Max</label>
            <Input
              type="number"
              {...register("salaryMax", { valueAsNumber: true })}
              placeholder="120000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-heading mb-1">
            Salary Currency
          </label>
          <Input {...register("salaryCurrency")} placeholder="USD" />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-heading mb-1">
            Application Deadline
          </label>
          <Input type="date" {...register("applicationDeadline")} />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
        <Link
          href={mode === "edit" && jobId ? `/recruiter/jobs/${jobId}` : "/recruiter/jobs"}
          className="inline-flex items-center justify-center rounded-md border border-border bg-background shadow-xs hover:bg-muted hover:text-foreground h-9 gap-1.5 px-2.5 text-sm font-medium whitespace-nowrap transition-all"
        >
          <ArrowLeftIcon className="size-4" />
          Cancel
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2Icon className="size-4 animate-spin" />}
          {mode === "create" ? "Create Job" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
