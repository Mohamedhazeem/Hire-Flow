// TODO: Swap with S3/Vercel Blob in production.
import { saveUpload } from "@/app/lib/upload";
import { fail, ok } from "@/app/lib/api-response";
import { getSession } from "@/app/features/auth/libs/auth";

export const runtime = "nodejs"; // needs fs access

export async function POST(request: Request): Promise<Response> {
  // Auth guard — must be signed in to upload
  const session = await getSession();
  if (!session?.user) {
    return fail("Unauthorized", 401);
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

//USAGE

// const form = new FormData();
// form.append("file", fileInput.files[0]);
// const res = await fetch("/api/upload", { method: "POST", body: form });
// const { data } = await res.json(); // data.url = "/uploads/..."
