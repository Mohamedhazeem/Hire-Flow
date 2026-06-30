"use client";

import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";
import { useUploadResume } from "@/app/features/user/hooks/use-resumes";

const SUCCESS_DURATION = 3000;

export function ResumeUploadButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const uploadMutation = useUploadResume();

  const resetToIdle = useCallback(() => {
    setShowSuccess(false);
  }, []);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setShowSuccess(false);

    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.type)) {
      setUploadError("Only PDF and DOC/DOCX files are accepted.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File exceeds the 5 MB limit.");
      e.target.value = "";
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("label", file.name);
      await uploadMutation.mutateAsync(formData);
      setShowSuccess(true);
      setTimeout(resetToIdle, SUCCESS_DURATION);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    }

    e.target.value = "";
  };

  const disabled = uploadMutation.isPending || showSuccess;

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFile}
        className="hidden"
        aria-label="Upload resume"
      />
      <Button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        variant={showSuccess ? "secondary" : "default"}
        className="gap-1.5"
      >
        {uploadMutation.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : showSuccess ? (
          <CheckCircle2 className="size-4" />
        ) : (
          <Upload className="size-4" />
        )}
        {uploadMutation.isPending
          ? "Uploading..."
          : showSuccess
            ? "Uploaded!"
            : "Upload Resume"}
      </Button>
      {uploadError && (
        <p className="text-xs text-error mt-1">{uploadError}</p>
      )}
    </div>
  );
}
