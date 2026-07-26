"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileTextIcon,
  StarIcon,
  DownloadIcon,
  PencilIcon,
  Trash2Icon,
  SparklesIcon,
  AlertCircle,
  XIcon,
  CheckIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmActionButton } from "@/components/shared/confirm-action-button";
import { AiSuggestionsPanel } from "@/app/features/user/components/ai-suggestions-panel";
import { useAiResumeEnhance, useApplyAiSuggestions } from "@/app/features/user/hooks/use-ai-resume-enhance";
import type { ResumeListItem } from "@/app/features/user/hooks/use-resumes";
import type { EnhancementsResponse, ResumeSuggestion } from "@/app/features/user/schema/resume-ai.schema";

type ResumeCardProps = {
  resume: ResumeListItem;
  onSetPrimary: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (fileUrl: string) => void;
  onEdit: (id: string) => void;
};

function AiErrorBanner({ message, onClose }: { message: string; onClose: () => void }) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(onClose, 10_000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-2 rounded-lg bg-error/5 border border-error/20 p-2.5"
    >
      <AlertCircle className="size-4 text-error shrink-0 mt-0.5" />
      <p className="text-xs text-text-muted flex-1">{message}</p>
      <button
        type="button"
        onClick={onClose}
        className="size-5 flex items-center justify-center rounded text-text-muted hover:text-text-body hover:bg-bg-muted transition-colors shrink-0"
        aria-label="Dismiss error"
      >
        <XIcon className="size-3" />
      </button>
    </motion.div>
  );
}

function formatSize(bytes: number | null): string {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export function ResumeCard({ resume, onSetPrimary, onDelete, onDownload, onEdit }: ResumeCardProps) {
  const [aiResult, setAiResult] = useState<EnhancementsResponse | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const isBuilder = !resume.fileUrl;
  const isPrimary = resume.isPrimary;
  const enhanceMutation = useAiResumeEnhance(resume.id);
  const applyMutation = useApplyAiSuggestions(resume.id);

  const handleAiEnhance = () => {
    setAiError(null);
    enhanceMutation.mutate(undefined, {
      onSuccess: (res) => {
        if (res) {
          setAiResult(res);
        } else {
          setAiError("AI features temporarily unavailable. Configure an API key to use this feature.");
        }
      },
      onError: (error) => {
        const msg = error instanceof Error ? error.message : "AI service error";
        setAiError(msg);
      },
    });
  };

  const handleApply = (suggestion: ResumeSuggestion) => {
    applyMutation.mutate(
      { suggestions: [suggestion] },
      {
        onError: (error) => {
          setAiError(error instanceof Error ? error.message : "Failed to apply suggestion");
          applyMutation.reset();
        },
      },
    );
  };

  return (
    <>
      <div className="rounded-xl border border-border-subtle bg-bg-surface shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                <FileTextIcon className="size-4 text-brand" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text-heading truncate">
                  {resume.label}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {formatDate(resume.createdAt)} &middot; {isBuilder ? "Builder" : formatSize(resume.fileSize)}
                </p>
              </div>
            </div>
            {isPrimary && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber/10 text-amber border border-amber/20 px-2 py-0.5 text-[10px] font-medium shrink-0">
                <StarIcon className="size-2.5" />
                Primary
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center rounded-full bg-bg-elevated text-text-muted border border-border-subtle px-2 py-0.5 text-[10px] font-medium">
              {isBuilder ? "Builder Resume" : resume.fileType?.split("/").pop()?.toUpperCase() ?? "File"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 pt-2 border-t border-border-subtle flex-wrap">
            {resume.fileUrl && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => onDownload(resume.fileUrl!)}
              >
                <DownloadIcon className="size-3.5" />
                Download
              </Button>
            )}

            {isBuilder && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => onEdit(resume.id)}
              >
                <PencilIcon className="size-3.5" />
                Edit
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={handleAiEnhance}
              disabled={enhanceMutation.isPending}
            >
              <SparklesIcon className="size-3.5" />
              {enhanceMutation.isPending ? "Analyzing..." : "AI Suggestions"}
            </Button>

            {!isPrimary && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => onSetPrimary(resume.id)}
              >
                <StarIcon className="size-3.5" />
                Set Primary
              </Button>
            )}

            <ConfirmActionButton
              action={() => onDelete(resume.id)}
              title="Delete Resume"
              description={`Are you sure you want to delete "${resume.label}"? Applications that used this resume will still show the submitted version.`}
              confirmLabel="Delete"
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs text-error hover:text-error hover:bg-error/5 border-error/20 hover:border-error/30"
            >
              <Trash2Icon className="size-3.5" />
              Delete
            </ConfirmActionButton>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {aiError ? <AiErrorBanner message={aiError} onClose={() => setAiError(null)} /> : null}
      </AnimatePresence>

      {aiResult && (
        <AiSuggestionsPanel
          result={aiResult}
          isBuilder={isBuilder}
          isApplying={applyMutation.isPending}
          onApply={handleApply}
          onClose={() => { setAiResult(null); setAiError(null); enhanceMutation.reset(); }}
        />
      )}
    </>
  );
}