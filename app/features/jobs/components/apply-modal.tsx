"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2Icon, XIcon, CheckCircleIcon, AlertCircleIcon, ExternalLinkIcon, FileTextIcon } from "lucide-react";

type ResumeOption = {
  id: string;
  label: string;
  fileUrl: string | null;
  builderData: unknown;
  isPrimary: boolean;
  createdAt: string;
};

type ApplyModalProps = { jobId: string; onClose: () => void };

export function ApplyModal({ jobId, onClose }: ApplyModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: resumes, isLoading: resumesLoading } = useQuery({
    queryKey: ["user", "resumes"],
    queryFn: async () => {
      const res = await apiClient<{ data: ResumeOption[] }>("/api/user/resumes");
      return res.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient<{ data: { id: string; status: string } }>(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        body: { resumeId: selectedResumeId, coverLetter: coverLetter || undefined },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "applications"] });
      queryClient.invalidateQueries({ queryKey: ["job", jobId] });
    },
    onError: (err: Error) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedResumeId) {
      setError("Please select a resume");
      return;
    }
    mutation.mutate();
  };

  const noResumes = !resumesLoading && resumes && resumes.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-bg-surface rounded-2xl shadow-xl overflow-hidden max-sm:inset-0 max-sm:fixed max-sm:rounded-none max-sm:h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <h2 className="text-lg font-semibold text-text-heading">Apply for this Job</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="size-8 flex items-center justify-center rounded-lg hover:bg-bg-muted text-text-muted transition-colors"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        {mutation.isSuccess ? (
          <div className="p-8 text-center">
            <div className="size-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="size-7 text-success" />
            </div>
            <h3 className="text-lg font-semibold text-text-heading mb-1">Application Submitted!</h3>
            <p className="text-sm text-text-muted mb-6">Your application has been sent successfully.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => router.push("/user/applications")}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium text-white bg-brand hover:bg-brand/90 rounded-lg transition-colors"
              >
                <ExternalLinkIcon className="size-3.5" /> View My Applications
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium text-text-body border border-border-subtle rounded-lg hover:bg-bg-muted transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="flex items-start gap-2 text-sm text-error bg-error/5 border border-error/20 rounded-lg px-4 py-3">
                <AlertCircleIcon className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-text-heading mb-1.5 block">
                Resume <span className="text-error">*</span>
              </label>
              {resumesLoading && <Skeleton className="h-10 rounded-lg" />}
              {noResumes && (
                <div className="text-sm text-text-muted bg-bg-muted border border-border-subtle rounded-lg px-4 py-3">
                  <p className="mb-2">You have no resumes yet.</p>
                  <button
                    type="button"
                    onClick={() => router.push("/user/resumes/builder")}
                    className="text-brand hover:underline"
                  >
                    Create a resume first
                  </button>
                </div>
              )}
              {!resumesLoading && resumes && resumes.length > 0 && (
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  aria-label="Select a resume"
                  className="w-full text-sm bg-bg-surface border border-border-subtle rounded-lg px-3 py-2.5 text-text-body appearance-none cursor-pointer focus:outline-none focus:border-brand/50"
                >
                  <option value="">Select a resume...</option>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label} {r.isPrimary ? "(Primary)" : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-text-heading mb-1.5 block">
                Cover Letter <span className="text-text-muted font-normal">(optional)</span>
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                maxLength={5000}
                rows={5}
                placeholder="Introduce yourself and explain why you're a great fit..."
                className="w-full text-sm bg-bg-surface border border-border-subtle rounded-lg px-3 py-2.5 text-text-body placeholder:text-text-muted resize-none focus:outline-none focus:border-brand/50"
              />
              <p className="text-xs text-text-muted text-right mt-1">{coverLetter.length}/5000</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={noResumes || mutation.isPending || !selectedResumeId}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-brand hover:bg-brand/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <FileTextIcon className="size-4" /> Submit Application
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={mutation.isPending}
                className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-text-body border border-border-subtle rounded-lg hover:bg-bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
