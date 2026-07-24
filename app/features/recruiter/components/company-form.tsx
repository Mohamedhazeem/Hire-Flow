"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CompanyProfileSchema,
  type CompanyProfileInput,
} from "@/app/features/recruiter/schema/company.schema";
import { upsertCompany } from "@/app/features/recruiter/actions/upsert-company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api/api-client";
import { Building2, Globe, Upload, CheckCircle2, AlertCircle, Eye, Trash2 } from "lucide-react";
import Image from "next/image";

type CompanyFormProps = {
  defaultValues?: CompanyProfileInput;
  readOnly?: boolean;
};

export function CompanyForm({ defaultValues, readOnly = false }: CompanyFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  const form = useForm<CompanyProfileInput>({
    resolver: zodResolver(CompanyProfileSchema),
    defaultValues: defaultValues ?? {
      name: "",
      description: "",
      website: "",
      logoUrl: "",
      industry: "",
    },
  });

  const logoUrl = useWatch({
    control: form.control,
    name: "logoUrl",
  });

  /** Delete a previously uploaded file from disk (best-effort) */
  const deletePreviousFile = async (url: string) => {
    if (!url) return;
    try {
      await apiClient("/api/upload", {
        method: "DELETE",
        body: { url },
      });
    } catch {
      // Best-effort — don't block the user if cleanup fails
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previousUrl = form.getValues("logoUrl");

    setUploading(true);
    setUploadError(null);

    try {
      const uploadForm = new FormData();
      uploadForm.append("file", file);
      const result = await apiClient<{ data?: { url: string }; url?: string }>("/api/upload", {
        method: "POST",
        body: uploadForm,
      });
      const uploadedUrl = result.data?.url ?? result.url;
      form.setValue("logoUrl", uploadedUrl ?? "", {
        shouldValidate: true,
        shouldDirty: true,
      });
      // Clean up the previous file after successful upload
      if (previousUrl) await deletePreviousFile(previousUrl);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveLogo = async () => {
    const currentUrl = form.getValues("logoUrl");
    form.setValue("logoUrl", "", { shouldValidate: true, shouldDirty: true });
    if (currentUrl) {
      setRemoving(true);
      await deletePreviousFile(currentUrl);
      setRemoving(false);
    }
  };

  const onSubmit = async (data: CompanyProfileInput) => {
    setServerError(null);
    setSuccess(false);

    try {
      const result = await upsertCompany(data);

      if (result.success) {
        setSuccess(true);
        form.reset(data);
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Failed to save company profile");
    }
  };

  if (readOnly && defaultValues) {
    return (
      <div className="w-full max-w-3xl space-y-6">
        <div className="rounded-xl border border-border-subtle bg-bg-surface p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
            <Eye className="size-4" />
            View-only mode &mdash; only the company owner can edit the profile
          </div>

          <div className="space-y-1">
            <span className="text-sm font-medium text-text-heading">Company name</span>
            <p className="text-text-body">{defaultValues.name || "—"}</p>
          </div>

          <div className="space-y-1">
            <span className="text-sm font-medium text-text-heading">Industry</span>
            <p className="text-text-body">{defaultValues.industry || "—"}</p>
          </div>

          <div className="space-y-1">
            <span className="text-sm font-medium text-text-heading">Website</span>
            <p className="text-text-body">{defaultValues.website || "—"}</p>
          </div>

          <div className="space-y-1">
            <span className="text-sm font-medium text-text-heading">Description</span>
            <p className="text-text-body whitespace-pre-wrap">{defaultValues.description || "—"}</p>
          </div>

          {defaultValues.logoUrl && (
            <div className="space-y-1">
              <span className="text-sm font-medium text-text-heading">Company logo</span>
              <Image
                src={defaultValues.logoUrl}
                alt="Company logo"
                width={80}
                height={80}
                className="size-20 rounded-lg border border-border-subtle object-cover"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-3xl space-y-6">
      <div className="rounded-xl border border-border-subtle bg-bg-surface p-6 sm:p-8 space-y-6">
        {/* Company Name */}
        <div className="space-y-1">
          <label htmlFor="company-name" className="text-sm font-medium text-text-heading">
            Company name <span className="text-error">*</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted pointer-events-none" />
            <Input
              id="company-name"
              placeholder="Acme Inc."
              className="pl-9"
              {...form.register("name")}
            />
          </div>
          {form.formState.errors.name && (
            <p className="text-xs text-error">{form.formState.errors.name.message}</p>
          )}
        </div>

        {/* Industry */}
        <div className="space-y-1">
          <label htmlFor="company-industry" className="text-sm font-medium text-text-heading">
            Industry
          </label>
          <Input
            id="company-industry"
            placeholder="Technology, Healthcare, Finance..."
            {...form.register("industry")}
          />
          {form.formState.errors.industry && (
            <p className="text-xs text-error">{form.formState.errors.industry.message}</p>
          )}
        </div>

        {/* Website */}
        <div className="space-y-1">
          <label htmlFor="company-website" className="text-sm font-medium text-text-heading">
            Website
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted pointer-events-none" />
            <Input
              id="company-website"
              type="url"
              placeholder="https://example.com"
              className="pl-9"
              {...form.register("website")}
            />
          </div>
          {form.formState.errors.website && (
            <p className="text-xs text-error">{form.formState.errors.website.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label htmlFor="company-description" className="text-sm font-medium text-text-heading">
            Description
          </label>
          <Textarea
            id="company-description"
            placeholder="Tell candidates about your company..."
            rows={4}
            className="min-h-24 resize-y"
            {...form.register("description")}
          />
          {form.formState.errors.description && (
            <p className="text-xs text-error">{form.formState.errors.description.message}</p>
          )}
        </div>

        {/* Logo Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-heading">Company logo</label>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Logo preview / placeholder */}
            {logoUrl ? (
              <div className="group relative w-fit">
                <Image
                  src={logoUrl}
                  alt="Company logo preview"
                  width={80}
                  height={80}
                  className="size-20 rounded-lg border border-border-subtle object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  disabled={removing}
                  className="absolute inset-0 flex size-20 items-center justify-center rounded-lg bg-error/80 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-100"
                  aria-label="Remove logo"
                >
                  {removing ? (
                    <span className="text-xs">Removing...</span>
                  ) : (
                    <Trash2 className="size-5" />
                  )}
                </button>
              </div>
            ) : (
              <div className="flex size-20 items-center justify-center rounded-lg border-2 border-dashed border-border-subtle bg-bg-elevated/50">
                <Building2 className="size-8 text-text-muted/40" />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label
                htmlFor="company-logo-upload"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-text-muted bg-bg-elevated border border-border-subtle hover:border-border hover:text-text-heading transition-colors"
              >
                <Upload className="size-4 shrink-0" />
                <span>{uploading ? "Uploading..." : "Upload logo"}</span>
              </label>
              <input
                id="company-logo-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleLogoUpload}
                disabled={uploading}
                className="hidden"
                aria-label="Upload company logo"
              />
              <span className="text-xs text-text-muted">
                {logoUrl
                  ? "Logo uploaded \u2014 save to apply"
                  : "JPEG, PNG, WebP, or GIF. Max 5 MB."}
              </span>
            </div>
          </div>

          {uploadError && <p className="text-xs text-error">{uploadError}</p>}
          {form.formState.errors.logoUrl && (
            <p className="text-xs text-error">{form.formState.errors.logoUrl.message}</p>
          )}
        </div>

        {/* Hidden logoUrl field for RHF */}
        <input type="hidden" {...form.register("logoUrl")} />
      </div>

      {/* Submit + Status */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          variant="default"
          size="default"
          className="w-full sm:w-auto"
        >
          {form.formState.isSubmitting ? "Saving..." : "Save company profile"}
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
