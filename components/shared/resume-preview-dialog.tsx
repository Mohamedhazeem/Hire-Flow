"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { XIcon, ChevronLeftIcon, ChevronRightIcon, DownloadIcon, FileTextIcon, AlertCircleIcon } from "lucide-react";

const PdfViewer = dynamic(() => import("./pdf-viewer"), { ssr: false });

type ResumePreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl: string | null;
  label: string;
  onDownload?: () => void;
  downloadError?: string | null;
};

export function ResumePreviewDialog({
  open,
  onOpenChange,
  fileUrl,
  label,
  onDownload,
  downloadError: externalDownloadError,
}: ResumePreviewDialogProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loadError, setLoadError] = useState(false);
  const [pdfLoadErrorMessage, setPdfLoadErrorMessage] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [pageRenderError, setPageRenderError] = useState(false);
  const [lastOpen, setLastOpen] = useState(false);

  if (open !== lastOpen) {
    setLastOpen(open);
    if (!open) {
      setNumPages(null);
      setPageNumber(1);
      setLoadError(false);
      setPdfLoadErrorMessage(null);
      setImgError(false);
      setPageRenderError(false);
    }
  }

  const ext = fileUrl?.split(".").pop()?.toLowerCase() ?? "";
  const isPdf = ext === "pdf";
  const isImage = ["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext);
  const isPreviewable = isPdf || isImage;

  const handleDialogDownload = useCallback(() => {
    if (onDownload) {
      onDownload();
    } else if (fileUrl) {
      const a = document.createElement("a");
      a.href = `/api/files/download?path=${encodeURIComponent(fileUrl)}`;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.click();
    }
  }, [onDownload, fileUrl]);

  const handlePdfLoadSuccess = useCallback(({ numPages: np }: { numPages: number }) => {
    if (np === 0) {
      setLoadError(true);
      setPdfLoadErrorMessage("No documents found in this PDF.");
    } else {
      setNumPages(np);
    }
  }, []);

  const handlePdfLoadError = useCallback(() => {
    setLoadError(true);
    setPdfLoadErrorMessage("Failed to load PDF — file may be corrupt or inaccessible.");
  }, []);

  const downloadUrl = fileUrl ? `/api/files/download?path=${encodeURIComponent(fileUrl)}` : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-lg:max-w-full max-lg:h-full max-lg:m-0 max-lg:rounded-none sm:max-w-3xl lg:max-w-4xl p-0 gap-0"
        showCloseButton={false}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
          <DialogTitle className="text-sm font-medium truncate">{label}</DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" onClick={handleDialogDownload} title="Download">
              <DownloadIcon className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => onOpenChange(false)} title="Close">
              <XIcon className="size-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-auto p-4 bg-bg-elevated flex flex-col items-center min-h-[60vh] max-lg:min-h-[calc(100vh-56px)]">
          {externalDownloadError && (
            <div className="flex items-center gap-2 text-xs text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2 mb-4 w-full max-w-md">
              <AlertCircleIcon className="size-3.5 shrink-0" />
              {externalDownloadError}
            </div>
          )}

          {!isPreviewable && downloadUrl && (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
              <FileTextIcon className="size-12 text-text-muted" />
              <p className="text-sm text-text-muted">Preview not available for this file type.</p>
              <Button onClick={handleDialogDownload}>
                <DownloadIcon className="size-4 mr-2" />
                Download File
              </Button>
            </div>
          )}

          {isPdf && downloadUrl && (
            <>
              {loadError ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12">
                  <AlertCircleIcon className="size-10 text-error" />
                  <p className="text-sm text-text-muted">{pdfLoadErrorMessage}</p>
                  <Button variant="outline" size="sm" onClick={handleDialogDownload}>
                    <DownloadIcon className="size-4 mr-1.5" />
                    Download Instead
                  </Button>
                </div>
              ) : pageRenderError ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12">
                  <AlertCircleIcon className="size-10 text-error" />
                  <p className="text-sm text-text-muted">Failed to render this page — file may be corrupted.</p>
                  <Button variant="outline" size="sm" onClick={handleDialogDownload}>
                    <DownloadIcon className="size-4 mr-1.5" />
                    Download Instead
                  </Button>
                </div>
              ) : (
                <PdfViewer
                  downloadUrl={downloadUrl}
                  pageNumber={pageNumber}
                  onLoadSuccess={handlePdfLoadSuccess}
                  onLoadError={handlePdfLoadError}
                  onRenderError={() => setPageRenderError(true)}
                  onPageChange={setPageNumber}
                />
              )}

              {numPages && numPages > 1 && !loadError && !pageRenderError && (
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

          {isImage && downloadUrl && !imgError && (
            <Image
              src={downloadUrl}
              alt={label}
              width={800}
              height={1200}
              className="max-w-full h-auto rounded-lg shadow-md"
              style={{ maxHeight: "80vh", width: "auto", height: "auto" }}
              unoptimized
              onError={() => {
                setImgError(true);
              }}
            />
          )}

          {!downloadUrl && (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <AlertCircleIcon className="size-10 text-text-muted" />
              <p className="text-sm text-text-muted">File not available.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
