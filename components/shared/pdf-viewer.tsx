import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

type PdfViewerProps = {
  downloadUrl: string;
  pageNumber: number;
  onLoadSuccess: (params: { numPages: number }) => void;
  onLoadError: () => void;
  onRenderError: () => void;
  onPageChange: (page: number) => void;
};

export default function PdfViewer({
  downloadUrl,
  pageNumber,
  onLoadSuccess,
  onLoadError,
  onRenderError,
}: PdfViewerProps) {
  return (
    <Document file={downloadUrl} onLoadSuccess={onLoadSuccess} onLoadError={onLoadError}>
      <Page
        pageNumber={pageNumber}
        width={Math.min(800, typeof window !== "undefined" ? window.innerWidth - 48 : 800)}
        onRenderError={onRenderError}
      />
    </Document>
  );
}
