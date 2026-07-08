"use client";

import { Input } from "@/components/ui/input";
import type { Control, FieldValues, Path } from "react-hook-form";
import { useWatch, useController } from "react-hook-form";

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string")
    return value.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

type CommaInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  placeholder?: string;
};

export function CommaInput<T extends FieldValues>({ control, name, placeholder }: CommaInputProps<T>) {
  const value = useWatch({ control, name }) as string[] | undefined;
  const { field } = useController({ control, name });
  return (
    <Input
      value={value?.join(", ") ?? ""}
      onChange={(e) => field.onChange(toArray(e.target.value))}
      placeholder={placeholder}
    />
  );
}

export { toArray };
