"use client";

import { useRef, useState, useDeferredValue, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchIcon, XIcon } from "lucide-react";

export function JobSearchBar() {
  const router = useRouter();
  const sp = useSearchParams();
  const [value, setValue] = useState(sp.get("search") ?? "");
  const deferredValue = useDeferredValue(value);
  const [, startTransition] = useTransition();
  const initialRef = useRef(true);

  useEffect(() => {
    if (initialRef.current) {
      initialRef.current = false;
      setValue(sp.get("search") ?? "");
    }
  }, [sp]);

  useEffect(() => {
    if (initialRef.current) return;
    const timer = setTimeout(() => {
      startTransition(() => {
        const np = new URLSearchParams(sp.toString());
        if (deferredValue) np.set("search", deferredValue);
        else np.delete("search");
        np.delete("page");
        router.push(`/jobs?${np.toString()}`);
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [deferredValue, router, sp]);

  return (
    <div className="relative flex-1 min-w-0">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search jobs..."
        className="w-full pl-10 pr-8 py-2.5 text-sm bg-bg-surface border border-border-subtle rounded-lg text-text-body placeholder:text-text-muted focus:outline-none focus:border-brand/50 transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 size-5 flex items-center justify-center text-text-muted hover:text-text-body"
        >
          <XIcon className="size-3.5" />
        </button>
      )}
    </div>
  );
}
