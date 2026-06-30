"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/app/features/auth/libs/auth-client";
import { apiClient } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { SearchIcon, MessageSquareTextIcon, Building2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { computeThreadId } from "@/lib/thread-utils";

type SearchResult = {
  id: string;
  name: string;
  email: string;
  role: string;
  company: { name: string } | null;
};

type StartConversationSearchProps = {
  searchEndpoint: string;
  messagesBasePath: string;
};

export function StartConversationSearch({
  searchEndpoint,
  messagesBasePath,
}: StartConversationSearchProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback(async (value: string) => {
    setQuery(value);
    setSelectedIndex(-1);

    if (value.length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    try {
      const res = await apiClient<{ data: SearchResult[] }>(
        `${searchEndpoint}?q=${encodeURIComponent(value)}`,
      );
      setResults(res.data);
      setIsOpen(res.data.length > 0);
    } catch {
      setResults([]);
      setIsOpen(false);
    }
  }, [searchEndpoint]);

  const navigateToThread = useCallback(
    (targetId: string) => {
      const currentUserId = (session?.user as { id?: string })?.id;
      if (!currentUserId) return;
      const threadId = computeThreadId(currentUserId, targetId);
      router.push(`${messagesBasePath}?thread=${threadId}`, { scroll: false });
    },
    [router, session, messagesBasePath],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || results.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        navigateToThread(results[selectedIndex].id);
        setIsOpen(false);
        setQuery("");
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    },
    [isOpen, results, selectedIndex, navigateToThread],
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
        <Input
          placeholder="Search by name or company..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          onKeyDown={handleKeyDown}
          className="pl-8"
        />
      </div>
      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-radius-md border border-border bg-bg-surface shadow-lg max-h-80 overflow-auto">
          {results.map((user, index) => (
            <li
              key={user.id}
              onClick={() => {
                navigateToThread(user.id);
                setIsOpen(false);
                setQuery("");
              }}
              onMouseEnter={() => setSelectedIndex(index)}
              className={cn(
                "flex items-start gap-3 px-3 py-2.5 cursor-pointer text-sm transition-colors",
                index === selectedIndex
                  ? "bg-accent-subtle/20 text-text-heading"
                  : "text-text-body hover:bg-bg-elevated",
              )}
            >
              <MessageSquareTextIcon className="size-4 mt-0.5 shrink-0 text-text-muted" />
              <div className="min-w-0 flex-1">
                <span className="block truncate font-medium">{user.name}</span>
                <span className="block truncate text-xs text-text-muted">{user.email}</span>
                {user.company && (
                  <span className="flex items-center gap-1 text-xs text-text-muted mt-0.5">
                    <Building2Icon className="size-3" />
                    {user.company.name}
                  </span>
                )}
              </div>
              <span className="shrink-0 text-xs capitalize text-text-muted">{user.role}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
