"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useResumes,
  useSetPrimaryResume,
  useDeleteResume,
} from "@/app/features/user/hooks/use-resumes";
import { ResumeCard } from "./resume-card";
import { ResumeUploadButton } from "./resume-upload-button";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileTextIcon, PlusIcon, AlertCircle } from "lucide-react";
import Link from "next/link";

async function downloadFile(fileUrl: string) {
  try {
    const res = await fetch(`/api/files/download?path=${encodeURIComponent(fileUrl)}`);
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileUrl.split("/").pop() ?? "resume";
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    // silent
  }
}

export function ResumeList() {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { data: resumes, isLoading, isError } = useResumes();
  const setPrimaryMutation = useSetPrimaryResume();
  const deleteMutation = useDeleteResume();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border-subtle p-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <AlertCircle className="size-8 text-error" />
        <p className="text-sm text-text-muted">Failed to load resumes. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <ResumeUploadButton />
        <Link href="/user/resumes/builder">
          <Button variant="outline" className="gap-1.5 w-full sm:w-auto">
            <PlusIcon className="size-4" />
            Build Resume
          </Button>
        </Link>
      </div>

      {!resumes || resumes.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="size-16 rounded-2xl bg-bg-elevated border border-border-subtle flex items-center justify-center">
            <FileTextIcon className="size-8 text-text-muted" />
          </div>
          <div>
            <h3 className="text-base font-medium text-text-heading">No resumes yet</h3>
            <p className="text-sm text-text-muted mt-1">
              Upload a file or build one from scratch to get started.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              isDeleting={deletingId === resume.id}
              onSetPrimary={(id) => setPrimaryMutation.mutate(id)}
              onDelete={(id) => {
                setDeletingId(id);
                deleteMutation.mutate(id, {
                  onSettled: () => setDeletingId(null),
                });
              }}
              onDownload={(fileUrl) => downloadFile(fileUrl)}
              onEdit={(id) => router.push(`/user/resumes/builder/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
