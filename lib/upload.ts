import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export type UploadResult = {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
};

function validateFile(file: File): void {
  if (file.size === 0) {
    throw new Error("File is empty.");
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File exceeds the 5 MB limit (received ${file.size} bytes).`);
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`File type "${file.type}" is not allowed.`);
  }
}

function buildFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase() || "";
  return `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
}

// ── Local storage (default, dev / self-hosted) ──────────────────────
async function saveLocal(file: File): Promise<UploadResult> {
  const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
  await mkdir(UPLOAD_DIR, { recursive: true });

  const filename = buildFilename(file.name);
  const destPath = path.join(UPLOAD_DIR, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(destPath, buffer);

  return {
    url: `/uploads/${filename}`,
    filename,
    size: file.size,
    mimeType: file.type,
  };
}

// ── Vercel Blob storage (production) ────────────────────────────────
// Uncomment when deploying to Vercel with BLOB_READ_WRITE_TOKEN set.
// import { put } from "@vercel/blob";
//
// async function saveVercelBlob(file: File): Promise<UploadResult> {
//   const filename = buildFilename(file.name);
//   const blob = await put(filename, file, {
//     access: "public",
//     token: process.env.BLOB_READ_WRITE_TOKEN,
//   });
//
//   return {
//     url: blob.url,
//     filename,
//     size: file.size,
//     mimeType: file.type,
//   };
// }

// ── Public API ──────────────────────────────────────────────────────
/**
 * Validates and saves a file, returning its public URL.
 * Currently uses local fs storage. Swap saveLocal for saveVercelBlob
 * (or another provider) when deploying to production.
 */
export async function saveUpload(file: File): Promise<UploadResult> {
  validateFile(file);
  return saveLocal(file);
  // return saveVercelBlob(file); // production
}

/**
 * Deletes a previously uploaded file by its public URL path.
 * Only removes files stored locally under /uploads/.
 * Returns true if deleted, false if not found.
 */
export async function deleteUpload(logoUrl: string): Promise<boolean> {
  // Only delete local uploads — cloud files need their own cleanup
  if (!logoUrl.startsWith("/uploads/")) return false;

  const filename = logoUrl.replace("/uploads/", "");
  // Prevent path traversal
  if (filename.includes("..") || filename.includes("/")) return false;

  const filePath = path.join(process.cwd(), "public", "uploads", filename);
  try {
    await unlink(filePath);
    return true;
  } catch {
    // File already gone or permissions issue — not fatal
    return false;
  }
}
