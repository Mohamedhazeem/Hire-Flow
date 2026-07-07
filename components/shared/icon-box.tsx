import { cn } from "@/lib/utils";

type IconBoxProps = {
  children: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
};

export function IconBox({ children, size = "md", className }: IconBoxProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-bg-elevated flex items-center justify-center text-text-muted shrink-0",
        size === "sm" ? "size-8" : "size-10",
        className,
      )}
    >
      {children}
    </div>
  );
}
