// TODO: Swap with S3/Vercel Blob in production.
import { NextRequest } from "next/server";
import { saveUpload } from "@/app/lib/upload";
import { fail, ok } from "@/lib/api-response";
import { UnauthorizedError } from "@/lib/api-error";
import { getSession } from "@/app/features/auth/libs/auth";
import { withErrorHandler } from "@/lib/api-wrapper";

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
    return fail("Expected multipart/form-data body.", 400);
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return fail('Missing "file" field in the form data.', 400);
  }

  // Simulate a brief processing delay (remove in production)
  await new Promise((r) => setTimeout(r, 300));

  try {
    const result = await saveUpload(file);
    return ok(result, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed.";
    return fail(message, 422);
  }
}

export const POST = withErrorHandler(handlePOST);
