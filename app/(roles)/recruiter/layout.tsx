import { checkRole } from "@/app/features/auth/utils/rbac";
import { RecruiterLayoutClient } from "./recruiter-layout-client";

export default async function RecruiterLayout({ children }: { children: React.ReactNode }) {
  await checkRole(["recruiter"]);

  return <RecruiterLayoutClient>{children}</RecruiterLayoutClient>;
}
