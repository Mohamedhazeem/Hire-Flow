# Fix: Applicant Detail Resume Resolution + Preview

## Problem

The recruiter applicant detail page (`/recruiter/applicants/[applicationId]`) shows the user's **current primary resume** from their profile, not the resume they submitted with their application. Three distinct issues:

1. **Wrong resume displayed** — If the user uploads a new resume after applying, the recruiter sees the newer one instead of the one submitted with the application.
2. **No fallback on deletion** — If the user deletes all their resumes from their profile, the page shows "No resume uploaded" even though `Application.resumeId` may reference the deleted record.
3. **`resumeId` unused** — The `Application` model already has a `resumeId` column (schema line 259), and the seed script populates it (seed.ts line 311), but the detail query never reads it.

## Design Decisions

| Decision          | Choice                                                                            | Rationale                                                                      |
| ----------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Resume resolution | Server-side (API returns single resolved resume + `source` field)                 | Privacy: doesn't leak whether user changed resumes after applying. Simpler UI. |
| File availability | Trust `fileUrl` field (DB-level check only)                                       | Pre-checking disk adds I/O to every detail page load. Rare case.               |
| Download error    | Client-side `fetch` + inline error state                                          | Avoids navigating to JSON 404 page. Error resets after 5s.                     |
| Resume preview    | `react-pdf` (PDF) + image modal (JPG/PNG/WebP/GIF) + download fallback (DOC/DOCX) | Most common resume formats. `react-pdf` is 6.9MB but well-maintained.          |
| Mobile first      | Full-screen dialog on mobile (`max-lg:`), modal on desktop                        | Resume preview must work on recruiter's phone.                                 |

## Edge Cases Covered

| Scenario                                                       | Resolved Behavior                                                               |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| User applied with resume A, then uploaded resume B (primary)   | Shows resume A with label "Resume Used for This Application"                    |
| User applied with resume A, then deleted resume A              | Falls back to current primary resume B with label "Current Resume"              |
| User applied with resume A, then deleted all resumes           | Shows "Resume was removed by the applicant" if `resumeId` was set and not found |
| Application has no `resumeId` (null), user has current primary | Shows current primary with label "Current Resume"                               |
| Application has no `resumeId`, user has no resumes at all      | Shows "No resume attached to this application"                                  |
| Application has `resumeId` pointing to valid existing resume   | Shows that exact resume with label "Resume Used for This Application"           |
| Resume has `fileUrl` pointing to file deleted from disk        | Download button shows inline "File unavailable — removed by applicant" error    |
| Resume is PDF                                                  | Opens preview with page navigation (react-pdf Document + Page)                  |
| Resume is image (JPG/PNG/WebP/GIF)                             | Opens preview showing image in a centered view                                  |
| Resume is DOC/DOCX                                             | Opens download directly (no browser preview available)                          |
| Resume has no `fileUrl` at all                                 | Shows "File not available" badge, no interactive button                         |
| Mobile viewport (<640px)                                       | Preview dialog goes full-screen, preview controls adjust                        |
| Download while preview is already open                         | Second download triggers directly without opening another preview               |

## Files to Change (4)

### 1. `app/features/recruiter/libs/get-applicant-detail.ts` — Server-side resolution

**Changes:**

- Add `resumeId: true` to the `Application` select
- Add `applicantResume` to the `ApplicantDetailResponse` type:

```ts
applicantResume: {
  id: string;
  label: string;
  fileUrl: string | null;
  isPrimary: boolean;
  createdAt: Date;
  source: "application" | "current_profile" | "deleted";
} | null;
```

**Fallback logic (server-side):**

```ts
let resolvedResume = null;
let resumeSource: "application" | "current_profile" | "deleted" | null = null;

if (application.resumeId) {
  const matched = profileResumes.find((r) => r.id === application.resumeId);
  if (matched) {
    resolvedResume = matched;
    resumeSource = "application";
  } else {
    // resumeId points to deleted record — flag it
    resumeSource = "deleted";
  }
}

if (!resolvedResume && profileResumes.length > 0) {
  resolvedResume = profileResumes.find((r) => r.isPrimary) ?? profileResumes[0];
  resumeSource = "current_profile";
}
```

### 2. `npx shadcn@latest add dialog` — Get Dialog for preview modal

Shadcn Dialog is almost certainly already installed. Verify and add if missing. Used for the ResumePreviewDialog overlay.

### 3. `npm install react-pdf` — PDF preview library

Install `react-pdf` at the version compatible with the project's React 19. Check peer deps.

Create `components/shared/resume-preview-dialog.tsx`:

```tsx
"use client";
import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { XIcon, ChevronLeftIcon, ChevronRightIcon, DownloadIcon, FileTextIcon } from "lucide-react";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

type ResumePreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl: string | null;
  label: string;
};

export function ResumePreviewDialog({ open, onOpenChange, fileUrl, label }: ResumePreviewDialogProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  // Detect file type from URL
  const ext = fileUrl?.split(".").pop()?.toLowerCase() ?? "";
  const isPdf = ext === "pdf";
  const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext);
  const isPreviewable = isPdf || isImage;

  // For non-previewable (DOC/DOCX), trigger download directly
  const handleDownload = useCallback(() => {
    if (!fileUrl) return;
    window.open(`/api/files/download?path=${encodeURIComponent(fileUrl)}`, "_blank");
  }, [fileUrl]);

  // Download fallback for non-previewable files
  if (!isPreviewable) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogTitle>{label}</DialogTitle>
          <div className="text-center py-8 space-y-4">
            <FileTextIcon className="size-12 text-text-muted mx-auto" />
            <p className="text-sm text-text-muted">Preview not available for this file type.</p>
            <Button onClick={handleDownload}>
              <DownloadIcon className="size-4 mr-2" />
              Download File
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-lg:max-w-full max-lg:h-full max-lg:m-0 max-lg:rounded-none sm:max-w-3xl lg:max-w-4xl p-0 gap-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
          <DialogTitle className="text-sm font-medium truncate">{label}</DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" onClick={handleDownload} title="Download">
              <DownloadIcon className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => onOpenChange(false)} title="Close">
              <XIcon className="size-4" />
            </Button>
          </div>
        </div>

        {/* Preview body */}
        <div className="overflow-auto p-4 bg-bg-elevated flex flex-col items-center min-h-[60vh] max-lg:min-h-[calc(100vh-56px)]">
          {isPdf && (
            <>
              <Document
                file={`/api/files/download?path=${encodeURIComponent(fileUrl!)}`}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              >
                <Page
                  pageNumber={pageNumber}
                  width={Math.min(800, typeof window !== "undefined" ? window.innerWidth - 48 : 800)}
                />
              </Document>

              {/* Pagination (only if more than 1 page) */}
              {numPages && numPages > 1 && (
                <div className="flex items-center gap-4 mt-4 pb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pageNumber <= 1}
                    onClick={() => setPageNumber((p) => p - 1)}
                  >
                    <ChevronLeftIcon className="size-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-xs text-text-muted tabular-nums">
                    {pageNumber} / {numPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pageNumber >= numPages}
                    onClick={() => setPageNumber((p) => p + 1)}
                  >
                    Next
                    <ChevronRightIcon className="size-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}

          {isImage && (
            <img
              src={`/api/files/download?path=${encodeURIComponent(fileUrl!)}`}
              alt={label}
              className="max-w-full h-auto rounded-lg shadow-md"
              style={{ maxHeight: "80vh" }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

Note: The preview fetches files through the existing `/api/files/download` endpoint for auth-guarded access. PDF is rendered via `react-pdf` `Document` component (accepts a URL directly). Images use a standard `<img>` tag pointing to the same endpoint.

### 4. `app/features/recruiter/components/applicant-detail-page.tsx` — UI updates

**Changes:**

A. **Replace resume selection** at line 138 with `applicantResume` from the response:

```ts
const applicantResume = detail.applicantResume;
```

B. **Add preview dialog state and download handler:**

```ts
const [previewOpen, setPreviewOpen] = useState(false);
const [downloadError, setDownloadError] = useState<string | null>(null);

async function handleDownload(fileUrl: string) {
  try {
    const res = await fetch(`/api/files/download?path=${encodeURIComponent(fileUrl)}`);
    if (!res.ok) {
      setDownloadError("File unavailable — removed by applicant");
      setTimeout(() => setDownloadError(null), 5000);
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileUrl.split("/").pop() ?? "resume";
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    setDownloadError("Download failed. Please try again.");
    setTimeout(() => setDownloadError(null), 5000);
  }
}
```

C. **Replace Resume Card** with source-aware rendering:

| `applicantResume` state                       | Display                                                                   |
| --------------------------------------------- | ------------------------------------------------------------------------- |
| `source === "application"`, has `fileUrl`     | "Resume Used for This Application" + Preview button + quick Download      |
| `source === "application"`, no `fileUrl`      | "Resume Used for This Application" + "File unavailable" badge (no button) |
| `source === "current_profile"`, has `fileUrl` | "Current Resume" + Preview button + quick Download                        |
| `source === "current_profile"`, no `fileUrl`  | "Current Resume" + "File unavailable" badge (no button)                   |
| `source === "deleted"`                        | "Resume was removed by the applicant" (no interactive elements)           |
| `null`                                        | "No resume attached to this application"                                  |

The Preview button extracts the file extension to determine behavior:

- **PDF/Image** → opens `ResumePreviewDialog`
- **DOC/DOCX** → directly triggers `handleDownload` (since no preview is possible)

D. **Add `DownloadIcon` import for the direct download button next to Preview.**

E. **Add `ResumePreviewDialog`** at the bottom of the component, initialized after status dialogs.

### Source label styling:

- "Resume Used for This Application": subtle `bg-brand/10 text-brand border border-brand/20` badge next to the label
- "Current Resume": `bg-bg-elevated text-text-muted border border-border-subtle` badge
- Both render only the source badge text — the visual distinction is the badge coloring

## Non-Goals

- **No schema changes** — `Application.resumeId` is already defined
- **No migration** — client generation is sufficient
- **No resume creation in the apply flow** — that's Phase 3 Step 3.3
- **No DOC/DOCX preview** — not possible without a server-side converter; download fallback is acceptable
- **No `pdfjs-dist` worker bundling** — uses the CDN/dist approach from `react-pdf` docs; if the worker fails to load, PDF preview gracefully handles the error with a fallback message

## Validation

```bash
npx tsc --noEmit
npm run lint
```

Manual test checklist:

- [ ] Application with `resumeId` pointing to existing resume → shows "Resume Used for This Application" badge
- [ ] Application with `resumeId` pointing to deleted resume → falls back; shows "Resume was removed by the applicant" if no other resumes exist
- [ ] Application with `resumeId` pointing to deleted resume + user has current primary → shows "Current Resume" with current primary
- [ ] Application with `resumeId = null` and user has primary → shows "Current Resume"
- [ ] Application with `resumeId = null` and user has no resumes → shows "No resume attached to this application"
- [ ] PDF resume → Preview button opens dialog with `react-pdf` renderer, page navigation works
- [ ] Image resume (JPG/PNG) → Preview button opens dialog showing the image
- [ ] DOC/DOCX resume → Preview button triggers download directly
- [ ] Resume with missing file on disk → Download shows inline error "File unavailable — removed by applicant"
- [ ] Preview dialog on mobile (<640px) → goes full-screen
- [ ] Preview dialog on desktop → centered modal, max-w-4xl
- [ ] CSV export still works (unrelated regression check)
- [ ] TypeScript 0 errors, ESLint 0 new warnings
