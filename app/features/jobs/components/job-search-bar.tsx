"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchIcon, XIcon } from "lucide-react";

export function JobSearchBar() {
  const router = useRouter();
  const sp = useSearchParams();
  const [value, setValue] = useState(sp.get("search") ?? "");

  const navigate = useCallback(
    (searchValue: string) => {
      const np = new URLSearchParams(sp.toString());
      if (searchValue) np.set("search", searchValue);
      else np.delete("search");
      np.delete("page");
      router.push(`/jobs?${np.toString()}`);
    },
    [router, sp],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value) navigate(value);
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex-1 min-w-0">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        enterKeyHint="search"
        placeholder="Search jobs..."
        className="w-full pl-10 pr-8 py-2.5 text-sm bg-bg-surface border border-border-subtle rounded-lg text-text-body placeholder:text-text-muted focus:outline-none focus:border-brand/50 transition-colors [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => navigate("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 size-5 flex items-center justify-center text-text-muted hover:text-text-body"
        >
          <XIcon className="size-3.5" />
        </button>
      )}
    </form>
  );
}
