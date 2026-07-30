"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import { Command } from "cmdk";
import { XIcon, ChevronsUpDownIcon, PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type AutocompleteInputProps = {
  value: string[];
  onChange: (value: string[]) => void;
  suggestions: string[];
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  maxItems?: number;
  allowCustom?: boolean;
  emptyMessage?: string;
};

export function AutocompleteInput({
  value,
  onChange,
  suggestions,
  placeholder = "Search or type...",
  disabled = false,
  id,
  maxItems = 50,
  allowCustom = true,
  emptyMessage = "No results found",
}: AutocompleteInputProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const atLimit = value.length >= maxItems;
  const isCustom =
    allowCustom &&
    search.trim() !== "" &&
    !suggestions.some((s) => s.toLowerCase() === search.toLowerCase());

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addItem = useCallback(
    (item: string) => {
      const trimmed = item.trim();
      if (!trimmed || atLimit) return;
      if (value.some((s) => s.toLowerCase() === trimmed.toLowerCase())) return;
      onChange([...value, trimmed]);
      setSearch("");
      setOpen(true);
      inputRef.current?.focus();
    },
    [value, onChange, atLimit],
  );

  const removeItem = useCallback(
    (item: string) => {
      onChange(value.filter((s) => s !== item));
      inputRef.current?.focus();
    },
    [value, onChange],
  );

  return (
    <div ref={containerRef} className="relative min-w-0" id={id}>
      <Command shouldFilter className="overflow-visible">
        <div
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          className={cn(
            "flex min-h-10 w-full flex-wrap items-center gap-1 rounded-lg border border-border-subtle bg-bg-surface px-2 py-2.5 text-sm",
            "focus-within:border-border-focus focus-within:ring-1 focus-within:ring-brand/30",
            disabled && "cursor-not-allowed opacity-50",
          )}
          onClick={() => !disabled && inputRef.current?.focus()}
        >
          {value.map((item) => (
            <Badge key={item} variant="secondary" className="gap-1 pl-2 pr-1">
              {item}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeItem(item);
                }}
                disabled={disabled}
                className="ml-0.5 rounded-full p-0.5 hover:bg-bg-elevated hover:text-error transition-colors"
                aria-label={`Remove ${item}`}
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          ))}
          <Command.Input
            ref={inputRef}
            value={search}
            onValueChange={setSearch}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !search && value.length > 0) {
                removeItem(value[value.length - 1]);
              }
              if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            disabled={disabled || atLimit}
            placeholder={
              value.length === 0 ? placeholder : atLimit ? `Max ${maxItems} items` : "Add more..."
            }
            className="min-w-30 flex-1 border-none bg-transparent py-0.5 text-sm text-text-body outline-none placeholder:text-text-muted disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.focus()}
            tabIndex={-1}
            className="shrink-0 p-0.5 text-text-muted"
            aria-hidden
          >
            <ChevronsUpDownIcon className="size-4" />
          </button>
        </div>

        {open && (
          <Command.List
            id={listboxId}
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-md border border-border-subtle bg-bg-surface shadow-lg outline-none"
          >
            {suggestions.map((item) => (
              <Command.Item
                key={item}
                value={item}
                onSelect={() => addItem(item)}
                disabled={value.some((s) => s.toLowerCase() === item.toLowerCase())}
                className={cn(
                  "flex cursor-pointer items-center px-3 py-2 text-sm text-text-body",
                  "hover:bg-brand-dark hover:text-text-inverse",
                  "data-disabled:cursor-not-allowed data-disabled:opacity-40 data-disabled:line-through",
                )}
              >
                {item}
              </Command.Item>
            ))}
            {isCustom && (
              <Command.Item
                value={search}
                onSelect={() => addItem(search.trim())}
                className="flex cursor-pointer items-center gap-2 border-t border-border-subtle px-3 py-2 text-sm text-text-body hover:bg-brand-dark hover:text-text-inverse"
              >
                <PlusIcon className="size-4 shrink-0 text-text-muted" />
                <span>
                  Add &ldquo;<span className="font-medium">{search.trim()}</span>&rdquo;
                </span>
              </Command.Item>
            )}
            <Command.Empty className="px-3 py-6 text-center text-sm text-text-muted">
              {emptyMessage}
            </Command.Empty>
          </Command.List>
        )}
      </Command>
    </div>
  );
}
