import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ActionButtonProps = {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  color?: "default" | "error";
};

export function ActionButton({
  icon,
  label,
  onClick,
  disabled,
  title,
  color = "default",
}: ActionButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={
        color === "error" ? "h-8 px-2 text-xs text-error hover:text-error" : "h-8 px-2 text-xs"
      }
    >
      <span className={cn("size-4 flex items-center justify-center", label && "sm:mr-1")}>
        {icon}
      </span>
      {label && <span className="hidden sm:inline">{label}</span>}
    </Button>
  );
}
