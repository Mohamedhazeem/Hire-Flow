import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/features/shared/api/require-role";
import { ValidationError, NotFoundError, ForbiddenError } from "@/lib/api-error";
import { withErrorHandler } from "@/lib/api-wrapper";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const MIME_MAP: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

async function handleGET(request: NextRequest) {
  await requireRole(["admin", "super_admin", "recruiter"]);

  const rawPath = request.nextUrl.searchParams.get("path");
  if (!rawPath) throw new ValidationError("Missing 'path' query parameter");

  const relativePath = rawPath.replace(/^\/uploads\//, "").replace(/^uploads[\\/]/, "");
  if (!relativePath || relativePath.includes("..")) {
    throw new ForbiddenError("Invalid file path");
  }

  const resolvedPath = path.join(UPLOAD_DIR, relativePath);

  if (!resolvedPath.startsWith(UPLOAD_DIR)) {
    throw new ForbiddenError("Path traversal detected");
  }

  if (!existsSync(resolvedPath)) {
    throw new NotFoundError("File not found or has been removed");
  }

  const stat = await import("fs/promises").then((m) => m.stat(resolvedPath));
  if (stat.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File exceeds the 10 MB download limit" },
      { status: 413 },
    );
  }

  const ext = path.extname(resolvedPath).toLowerCase();
  const mimeType = MIME_MAP[ext] ?? "application/octet-stream";

  const buffer = await readFile(resolvedPath);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": mimeType,
      "Content-Disposition": `inline; filename="${relativePath}"`,
      "Content-Length": String(stat.size),
      "Cache-Control": "private, max-age=3600",
    },
  });
}

export const GET = withErrorHandler(handleGET);
