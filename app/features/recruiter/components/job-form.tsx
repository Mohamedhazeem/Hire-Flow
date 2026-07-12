"use client";

import { useForm, useWatch, type Control, type FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { JobCreateSchema, type JobFormInput } from "@/app/features/recruiter/schema/job.schema";
import { useCreateJob, useUpdateJob } from "@/app/features/recruiter/hooks/use-recruiter-jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ArrowLeftIcon, Loader2Icon } from "lucide-react";
import Link from "next/link";
import { FormField } from "@/components/shared/form-field";
import { CommaInput } from "@/components/shared/comma-input";

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

type JobFormProps = { mode: "create" | "edit"; jobId?: string; defaultValues?: Partial<JobFormInput> };

export function JobForm({ mode, jobId, defaultValues }: JobFormProps) {
  const router = useRouter();
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();

  const { register, handleSubmit, setValue, control, formState: { errors, isSubmitting } } = useForm<JobFormInput>({
    resolver: zodResolver(JobCreateSchema) as never,
    defaultValues: {
      title: "", description: "", locations: [], workMode: "remote",
      employmentType: "full_time", timezone: "", skills: [], tags: [],
      experienceLevel: "", salaryMin: undefined, salaryMax: undefined,
      salaryCurrency: "USD", applicationDeadline: "", ...defaultValues,
    },
  });

  const workMode = useWatch({ control, name: "workMode" });
  const employmentType = useWatch({ control, name: "employmentType" });

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
        <FormField label="Title" required error={errors.title}>
          <Input {...register("title")} placeholder="Senior Frontend Engineer" />
        </FormField>

        <FormField label="Description" required error={errors.description}>
          <Textarea {...register("description")} placeholder="Describe the role, responsibilities, and qualifications..." rows={6} />
        </FormField>

        <FormField label="Locations (comma-separated)" required error={errors.locations as FieldError | undefined}>
          <CommaInput control={control as unknown as Control<JobFormInput>} name="locations" placeholder="New York, London, Remote" />
        </FormField>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <FormField label="Work Mode" required>
              <Select value={workMode} onValueChange={(v) => setValue("workMode", v as JobFormInput["workMode"], { shouldValidate: true })}>
                <SelectTrigger className="w-full">
                  <SelectValue>{WORK_MODE_OPTIONS.find((o) => o.value === workMode)?.label ?? workMode}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {WORK_MODE_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <div className="flex-1">
            <FormField label="Employment Type" required>
              <Select value={employmentType} onValueChange={(v) => setValue("employmentType", v as JobFormInput["employmentType"], { shouldValidate: true })}>
                <SelectTrigger className="w-full">
                  <SelectValue>{EMPLOYMENT_TYPE_OPTIONS.find((o) => o.value === employmentType)?.label ?? employmentType}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </div>

        <FormField label="Timezone">
          <Input {...register("timezone")} placeholder="EST / GMT-5" />
        </FormField>

        <FormField label="Skills (comma-separated)">
          <CommaInput control={control as unknown as Control<JobFormInput>} name="skills" placeholder="React, TypeScript, Node.js" />
        </FormField>

        <FormField label="Tags (comma-separated)">
          <CommaInput control={control as unknown as Control<JobFormInput>} name="tags" placeholder="engineering, frontend, senior" />
        </FormField>

        <FormField label="Experience Level" required error={errors.experienceLevel}>
          <Input {...register("experienceLevel")} placeholder="Senior, Lead, 5+ years" />
        </FormField>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <FormField label="Salary Min">
              <Input type="number" {...register("salaryMin", { valueAsNumber: true })} placeholder="80000" />
            </FormField>
          </div>
          <div className="flex-1">
            <FormField label="Salary Max">
              <Input type="number" {...register("salaryMax", { valueAsNumber: true })} placeholder="120000" />
            </FormField>
          </div>
        </div>

        <FormField label="Salary Currency">
          <Input {...register("salaryCurrency")} placeholder="USD" />
        </FormField>

        <FormField label="Application Deadline">
          <Input type="date" {...register("applicationDeadline")} />
        </FormField>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
        <Link href={mode === "edit" && jobId ? `/recruiter/jobs/${jobId}` : "/recruiter/jobs"} className="inline-flex items-center justify-center rounded-md border border-border bg-background shadow-xs hover:bg-muted hover:text-foreground h-9 gap-1.5 px-2.5 text-sm font-medium whitespace-nowrap transition-all">
          <ArrowLeftIcon className="size-4" /> Cancel
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2Icon className="size-4 animate-spin" />}
          {mode === "create" ? "Create Job" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
