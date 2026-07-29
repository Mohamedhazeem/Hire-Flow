import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/features/shared/api/require-role";
import { prisma } from "@/lib/prisma";
import { ValidationError, NotFoundError, ForbiddenError } from "@/lib/api/api-error";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { env } from "@/utils/env";

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
  const session = await requireRole(["admin", "super_admin", "recruiter", "user"]);

  const rawPath = request.nextUrl.searchParams.get("path");
  if (!rawPath) throw new ValidationError("Missing 'path' query parameter");

  // ── Cloud URL path ──────────────────────────────────────────
  if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
    if (rawPath.includes("..")) {
      throw new ForbiddenError("Invalid file path");
    }

    // Determine if this needs auth: resumes are private, logos are public
    const isResume =
      rawPath.includes("blob.vercel-storage.com") &&
      session.role !== "recruiter" &&
      session.role !== "admin" &&
      session.role !== "super_admin";
    const needsAuth =
      isResume || (session.role === "user" && rawPath.includes("blob.vercel-storage.com"));

    // The upload route uses "public" for logos and "private" for resumes.
    // We infer privacy from the caller context rather than the URL.
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN || env.data?.BLOB_READ_WRITE_TOKEN;
    const headers: Record<string, string> = {};
    if (blobToken && needsAuth) {
      headers["Authorization"] = `Bearer ${blobToken}`;
    }

    const upstream = await fetch(rawPath, { headers });
    if (!upstream.ok) {
      throw new NotFoundError("File not found or access denied on remote storage");
    }

    const ext = path.extname(new URL(rawPath).pathname).toLowerCase();
    const mimeType = MIME_MAP[ext] ?? "application/octet-stream";

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${path.basename(rawPath)}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  }

  // ── Local filesystem path (unchanged) ───────────────────────
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

  if (session.role === "user") {
    const resume = await prisma.resume.findFirst({
      where: { userId: session.id, fileUrl: { contains: relativePath }, deletedAt: null },
      select: { id: true },
    });
    if (!resume) {
      throw new ForbiddenError("You do not have access to this file");
    }
  }

  const stat = await import("fs/promises").then((m) => m.stat(resolvedPath));
  if (stat.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "File exceeds the 10 MB download limit" }, { status: 413 });
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
