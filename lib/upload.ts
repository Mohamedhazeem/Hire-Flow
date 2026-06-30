// TODO: Swap with S3/Vercel Blob in production.
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
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

/**
 * Saves a File object to /public/uploads and returns the public URL.
 * Local-only — replace with S3/Blob in production.
 */
export async function saveUpload(file: File): Promise<UploadResult> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File exceeds the 5 MB limit (received ${file.size} bytes).`);
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`File type "${file.type}" is not allowed.`);
  }

  // Ensure upload directory exists
  await mkdir(UPLOAD_DIR, { recursive: true });

  // Build a collision-resistant filename: <timestamp>-<random>.<ext>
  const ext = path.extname(file.name).toLowerCase() || "";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
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
