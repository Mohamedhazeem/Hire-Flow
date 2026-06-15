interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-page px-4">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-brand-light rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-accent-light rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="relative w-full max-w-md bg-bg-elevated/50 backdrop-blur-xl border border-border/50 rounded-2xl shadow-brand p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-text-heading">{title}</h1>
          <p className="text-text-muted">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
