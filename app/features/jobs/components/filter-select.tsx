"use client";

type FilterSelectProps = {
  label: string;
  paramKey: string;
  options: readonly string[];
  value: string | undefined;
  onChange: (key: string, v: string | undefined) => void;
  labels?: Record<string, string>;
};

export function FilterSelect({ label, paramKey, options, value, onChange, labels }: FilterSelectProps) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(paramKey, e.target.value || undefined)}
      aria-label={label}
      className="w-full sm:w-36 text-sm bg-bg-surface border border-border-subtle rounded-lg px-3 py-2 text-text-body appearance-none cursor-pointer transition-colors hover:border-brand/30"
    >
      <option value="">{label}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {labels?.[opt] ?? opt.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
        </option>
      ))}
    </select>
  );
}
