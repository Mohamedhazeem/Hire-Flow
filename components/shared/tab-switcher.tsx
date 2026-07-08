import { type ReactNode } from "react";

type TabOption<T extends string> = {
  value: T;
  label: string;
  icon?: ReactNode;
};

type TabSwitcherProps<T extends string> = {
  tabs: TabOption<T>[];
  active: T;
  onChange: (value: T) => void;
};

export function TabSwitcher<T extends string>({ tabs, active, onChange }: TabSwitcherProps<T>) {
  return (
    <div className="flex gap-1 rounded-xl bg-bg-elevated p-1 w-fit border border-border-subtle">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            active === tab.value
              ? "bg-bg-surface text-text-heading shadow-sm border border-border-subtle"
              : "text-text-muted hover:text-text-heading hover:bg-bg-surface/50"
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
