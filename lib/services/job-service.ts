import { NotFoundError, ForbiddenError, ValidationError } from "@/lib/api/api-error";
import { jobRepository } from "@/lib/repositories/job-repository";
import { slugify, ensureUniqueSlug } from "@/lib/slugify";
import { slugExists } from "@/lib/resolvers/job-resolver";
import { AdminToggleJobStatusSchema } from "@/app/features/admin/schema/admin.schema";

export const jobService = {
  async adminToggleStatus(jobId: string, isActive: boolean) {
    const existing = await jobRepository.findById(jobId);

    if (!existing) {
      throw new NotFoundError("Job not found");
    }

    const parsed = AdminToggleJobStatusSchema.safeParse({ isActive });
    if (!parsed.success) {
      throw new ValidationError("isActive must be a boolean");
    }

    await jobRepository.update(jobId, { isActive: parsed.data.isActive });

    return { toggled: true, isActive: parsed.data.isActive };
  },

  async adminDelete(jobId: string) {
    const existing = await jobRepository.findById(jobId);

    if (!existing) {
      throw new NotFoundError("Job not found");
    }

    await jobRepository.delete(jobId);

    return { deleted: true };
  },

  async recruiterCreateJob(
    companyId: string,
    recruiterId: string,
    data: {
      title: string;
      description: string;
      locations: string[];
      workMode: string;
      employmentType: string;
      timezone?: string | null;
      skills: string[];
      tags: string[];
      experienceLevel: string;
      salaryMin?: number | null;
      salaryMax?: number | null;
      salaryCurrency: string;
      applicationDeadline?: string | null;
    },
  ) {
    const deadline = data.applicationDeadline ? new Date(data.applicationDeadline) : undefined;

    const baseSlug = slugify(data.title);
    const slug = await ensureUniqueSlug(baseSlug, slugExists);

    const job = await jobRepository.create({
      slug,
      recruiterId,
      companyId,
      title: data.title,
      description: data.description,
      locations: data.locations,
      workMode: data.workMode,
      employmentType: data.employmentType,
      timezone: data.timezone || null,
      skills: data.skills,
      tags: data.tags,
      experienceLevel: data.experienceLevel,
      salaryMin: data.salaryMin ?? null,
      salaryMax: data.salaryMax ?? null,
      salaryCurrency: data.salaryCurrency,
      applicationDeadline: deadline ?? null,
      status: "draft",
    });

    return { job };
  },

  async recruiterUpdateJob(jobId: string, companyId: string, data: Record<string, unknown>) {
    const existing = await jobRepository.findOwnedBy(jobId, companyId);

    if (!existing) {
      throw new NotFoundError("Job not found");
    }

    if (existing.companyId !== companyId) {
      throw new ForbiddenError("You do not have access to this job");
    }

    if (existing.status === "archived") {
      throw new ValidationError("Archived jobs cannot be edited. Reactivate the job first.");
    }

    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.locations !== undefined) updateData.locations = data.locations;
    if (data.workMode !== undefined) updateData.workMode = data.workMode;
    if (data.employmentType !== undefined) updateData.employmentType = data.employmentType;
    if (data.timezone !== undefined) updateData.timezone = data.timezone || null;
    if (data.skills !== undefined) updateData.skills = data.skills;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.experienceLevel !== undefined) updateData.experienceLevel = data.experienceLevel;
    if (data.salaryMin !== undefined) updateData.salaryMin = (data.salaryMin as number | null) ?? null;
    if (data.salaryMax !== undefined) updateData.salaryMax = (data.salaryMax as number | null) ?? null;
    if (data.salaryCurrency !== undefined) updateData.salaryCurrency = data.salaryCurrency;
    if (data.applicationDeadline !== undefined) {
      updateData.applicationDeadline = data.applicationDeadline
        ? new Date(data.applicationDeadline as string)
        : undefined;
    }

    const job = await jobRepository.update(jobId, updateData);
    return { job };
  },

  async recruiterDeleteJob(jobId: string, companyId: string, force?: boolean) {
    const existing = await jobRepository.findOwnedBy(jobId, companyId);

    if (!existing) {
      throw new NotFoundError("Job not found");
    }

    if (existing.companyId !== companyId) {
      throw new ForbiddenError("You do not have access to this job");
    }

    let hardDeleted = false;

    if (existing.status === "draft" || force) {
      await jobRepository.delete(jobId);
      hardDeleted = true;
    } else {
      await jobRepository.update(jobId, { status: "archived" });
    }

    return { deleted: true, hardDeleted };
  },

  async recruiterToggleStatus(jobId: string, companyId: string, newStatus: "active" | "archived") {
    const existing = await jobRepository.findOwnedBy(jobId, companyId);

    if (!existing) {
      throw new NotFoundError("Job not found");
    }

    if (existing.companyId !== companyId) {
      throw new ForbiddenError("You do not have access to this job");
    }

    if (newStatus === "active" && existing.status !== "draft") {
      throw new ValidationError(
        existing.status === "archived" ? "Use the edit form to reactivate an archived job." : "Job is already active.",
      );
    }

    if (newStatus === "archived" && existing.status !== "active") {
      throw new ValidationError(
        existing.status === "draft" ? "Cannot archive a draft job. Publish it first." : "Job is already archived.",
      );
    }

    const job = await jobRepository.update(jobId, {
      status: newStatus,
      isActive: newStatus === "active",
    });

    return { job };
  },

  async incrementView(jobId: string) {
    const existing = await jobRepository.findById(jobId);

    if (!existing) {
      throw new NotFoundError("Job not found");
    }

    await jobRepository.incrementViewCount(jobId);

    return { success: true };
  },
};
