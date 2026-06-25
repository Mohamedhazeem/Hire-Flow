type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
};

export function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <div className="rounded-radius-lg border border-border-subtle bg-bg-surface p-5 flex items-start gap-4">
      <div className="size-10 rounded-radius-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-text-muted">{title}</p>
        <p className="text-2xl font-bold text-text-heading mt-1">{value}</p>
        {description && <p className="text-xs text-text-muted mt-1">{description}</p>}
      </div>
    </div>
  );
}
