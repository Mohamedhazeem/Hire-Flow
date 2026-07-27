"use client";

import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { SKILLS_DATABASE } from "@/data/skills-database";

const MAX_SKILLS = 30;

type SkillInputProps = {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
};

export function SkillInput(props: SkillInputProps) {
  return (
    <AutocompleteInput
      {...props}
      suggestions={SKILLS_DATABASE}
      maxItems={MAX_SKILLS}
      placeholder={props.placeholder ?? "Search or type a skill..."}
      emptyMessage="No skills found"
    />
  );
}
