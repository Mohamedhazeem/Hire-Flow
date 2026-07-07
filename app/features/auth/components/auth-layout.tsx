import { AuthBackground } from "./auth-background";
import { AuthCard } from "./auth-card";

interface Props {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children }: Props) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-page px-4">
      <AuthBackground />

      <AuthCard title={title} subtitle={subtitle}>
        {children}
      </AuthCard>
    </div>
  );
}
