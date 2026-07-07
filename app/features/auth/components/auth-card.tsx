interface Props {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthCard({ title, subtitle, children }: Props) {
  return (
    <div className="relative z-20 w-full max-w-md rounded-2xl border border-border/50 bg-bg-elevated p-8 shadow-brand">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-text-heading">{title}</h1>

        <p className="text-text-muted">{subtitle}</p>
      </div>

      <div className="mt-6">{children}</div>
    </div>
  );
}
