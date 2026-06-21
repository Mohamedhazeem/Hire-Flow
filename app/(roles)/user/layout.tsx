import { checkRole } from "@/app/features/auth/utils/rbac";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkRole(["user"]);

  return <>{children}</>;
}
