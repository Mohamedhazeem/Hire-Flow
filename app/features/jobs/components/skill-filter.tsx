"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SKILLS_DATABASE } from "@/data/skills-database";

type SkillFilterProps = {
  value: string[];
  onChange: (skills: string[]) => void;
  disabled?: boolean;
};

export function SkillFilter({ value, onChange, disabled = false }: SkillFilterProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const filtered = useMemo(() => {
    if (!search.trim()) return SKILLS_DATABASE;
    const q = search.toLowerCase();
    return SKILLS_DATABASE.filter((s) => s.toLowerCase().includes(q));
  }, [search]);

  const count = value.length;

  const displayLabel = useMemo(() => {
    if (count === 0) return "Skills";
    if (count <= 2) return value.join(", ");
    return `${value[0]}, ${value[1]}...`;
  }, [value, count]);

  function toggle(skill: string) {
    if (value.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      onChange(value.filter((s) => s.toLowerCase() !== skill.toLowerCase()));
    } else {
      onChange([...value, skill]);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={disabled}
        aria-label="Filter by skills"
        className={cn(
          "relative w-full min-w-0 flex items-center justify-center gap-1.5 text-sm bg-bg-surface border border-border-subtle rounded-lg px-3 py-2.5 text-text-body cursor-pointer transition-colors hover:border-brand/30 overflow-visible",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <span className={cn("min-w-0 truncate", count === 0 ? "text-text-muted" : "")}>{displayLabel}</span>
        <ChevronDown className="size-4 shrink-0 text-text-muted" />
        {count > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center size-5 rounded-full bg-brand text-[10px] font-bold text-text-inverse leading-none pointer-events-none">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 left-0 w-64 bg-bg-surface border border-border-subtle rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-border-subtle/50">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search skills..."
              className="w-full px-2.5 py-1.5 text-sm bg-bg-base border border-border-subtle rounded-md text-text-body outline-none placeholder:text-text-muted focus:border-brand/50"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="px-3 py-4 text-center text-sm text-text-muted">No matching skills</p>
            )}
            {filtered.map((skill) => {
              const isSelected = value.some((s) => s.toLowerCase() === skill.toLowerCase());
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggle(skill)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm transition-colors",
                    isSelected
                      ? "bg-brand/10 text-brand font-medium"
                      : "text-text-body",
                    "hover:bg-brand/80 hover:text-text-inverse",
                  )}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
