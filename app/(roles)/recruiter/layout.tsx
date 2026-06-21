import { checkRole } from "@/app/features/auth/utils/rbac";

export default async function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkRole(["recruiter"]);

  return <>{children}</>;
}
