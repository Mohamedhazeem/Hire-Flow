"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

type FilterSelectProps = {
  label: string;
  paramKey: string;
  options: readonly string[];
  value: string | undefined;
  onChange: (key: string, v: string | undefined) => void;
  labels?: Record<string, string>;
};

export function FilterSelect({
  label,
  paramKey,
  options,
  value,
  onChange,
  labels,
}: FilterSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = value
    ? (labels?.[value] ?? value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()))
    : label;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={label}
          className="w-full min-w-0 flex items-center justify-center gap-1.5 text-sm bg-bg-surface border border-border-subtle rounded-lg px-3 py-2.5 text-text-body cursor-pointer transition-colors hover:border-brand/30 truncate"
      >
        <span>{selectedLabel}</span>
        <ChevronDown className="size-4 shrink-0 text-text-muted" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 left-1/2 -translate-x-1/2 w-full min-w-40 bg-bg-surface border border-border-subtle rounded-xl shadow-lg overflow-hidden">
          {options.map((opt, idx) => {
            const display =
              labels?.[opt] ?? opt.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
            const isSelected = value === opt;
            return (
<button
                 key={opt}
                 type="button"
                 onClick={() => {
                   onChange(paramKey, value === opt ? undefined : opt);
                   setOpen(false);
                 }}
                 className={`w-full text-center px-3 py-2 text-sm transition-colors ${
                   isSelected
                     ? "bg-brand/10 text-brand font-medium"
                     : "text-text-body"
                 } hover:bg-brand/80 hover:text-text-inverse ${idx < options.length - 1 ? "border-b border-border-subtle/50" : ""}`}
               >
                {display}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
