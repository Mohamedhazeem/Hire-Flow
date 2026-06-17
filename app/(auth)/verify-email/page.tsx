import { getSession } from "@/app/features/auth/libs/auth";
import { getRedirectPath } from "@/app/features/auth/utils/getRedirectPath";
import { redirect } from "next/navigation";

export default async function VerifyEmailPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login?verified=success");
  }

  const redirectPath = getRedirectPath(session.user);
  redirect(redirectPath);
}
