"use client";

import { useState } from "react";
import { SlidersHorizontalIcon, XIcon } from "lucide-react";

type CollapsibleFiltersProps = {
  children: React.ReactNode;
  label?: string;
  defaultOpen?: boolean;
};

export function CollapsibleFilters({
  children,
  label = "Filters",
  defaultOpen = false,
}: CollapsibleFiltersProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="sm:hidden inline-flex items-center gap-2 text-sm font-medium text-text-body hover:text-text-heading transition-colors"
      >
        {open ? (
          <>
            <XIcon className="size-4" />
            Hide {label}
          </>
        ) : (
          <>
            <SlidersHorizontalIcon className="size-4" />
            Show {label}
          </>
        )}
      </button>

      <div className={open ? "mt-3 sm:mt-0" : "hidden sm:block"}>
        {children}
      </div>
    </div>
  );
}
