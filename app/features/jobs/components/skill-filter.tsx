"use client";

import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { SKILLS_DATABASE } from "@/data/skills-database";

type SkillFilterProps = {
  value: string[];
  onChange: (skills: string[]) => void;
  disabled?: boolean;
  maxItems?: number;
};

export function SkillFilter({
  value,
  onChange,
  disabled = false,
  maxItems = 10,
}: SkillFilterProps) {
  return (
    <AutocompleteInput
      value={value}
      onChange={onChange}
      suggestions={SKILLS_DATABASE}
      placeholder="Filter by skills..."
      disabled={disabled}
      maxItems={maxItems}
      allowCustom
      emptyMessage="No matching skills found"
    />
  );
}
