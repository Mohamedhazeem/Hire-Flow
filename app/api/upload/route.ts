import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api/api-response";
import { UnauthorizedError, ValidationError } from "@/lib/api/api-error";
import { getSession } from "@/app/features/auth/libs/auth";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { saveUpload } from "@/lib/upload";

export const runtime = "nodejs"; // needs fs access

async function handlePOST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    throw new UnauthorizedError();
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

  try {
    const result = await saveUpload(file);
    return ok(result, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed.";
    return fail(message, 422);
  }
}

export const POST = withErrorHandler(handlePOST);
