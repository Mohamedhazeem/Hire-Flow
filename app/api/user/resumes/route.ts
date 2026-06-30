import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { prisma } from "@/lib/prisma";
import { ValidationError } from "@/lib/api-error";
import { withErrorHandler } from "@/lib/api-wrapper";

async function handleGET() {
  const session = await requireRole(["user"]);

  const resumes = await prisma.resume.findMany({
    where: { userId: session.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      label: true,
      fileUrl: true,
      fileName: true,
      fileSize: true,
      fileType: true,
      builderData: true,
      isPrimary: true,
      createdAt: true,
    },
  });

  return ok({ data: resumes });
}

async function handlePOST(request: NextRequest) {
  const session = await requireRole(["user"]);

  const existingCount = await prisma.resume.count({
    where: { userId: session.id, deletedAt: null },
  });
  if (existingCount >= 5) {
    throw new ValidationError(
      "Resume limit reached (5). Please delete an existing resume before uploading a new one.",
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    throw new ValidationError("Expected multipart/form-data body.");
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new ValidationError('Missing "file" field in the form data.');
  }

  const allowedMimes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (!allowedMimes.includes(file.type)) {
    throw new ValidationError("Only PDF and DOC/DOCX files are accepted.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new ValidationError("File exceeds the 5 MB limit.");
  }

  const { saveUpload } = await import("@/lib/upload");
  const uploadResult = await saveUpload(file);

  const resume = await prisma.resume.create({
    data: {
      userId: session.id,
      label: (formData.get("label") as string) || file.name,
      fileUrl: uploadResult.url,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    },
  });

  return ok({ data: resume }, 201);
}

export const GET = withErrorHandler(handleGET);
export const POST = withErrorHandler(handlePOST);
