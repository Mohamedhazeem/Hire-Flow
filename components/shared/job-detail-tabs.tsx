import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Tab = { href: string; label: string; icon: LucideIcon };

type JobDetailTabsProps = { tabs: Tab[]; baseHref: string; className?: string };

export function JobDetailTabs({ tabs, baseHref, className }: JobDetailTabsProps) {
  const pathname = usePathname();
  return (
    <div className={cn("flex gap-4 border-b border-border-subtle -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8", className)}>
      {tabs.map((tab) => {
        const href = `${baseHref}${tab.href}`;
        const isActive = tab.href === ""
          ? pathname === baseHref
          : pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={tab.href}
            href={href}
            className={cn(
              "pb-3 text-sm font-medium border-b-2 transition-colors inline-flex items-center gap-1.5",
              isActive
                ? "border-brand text-text-heading"
                : "border-transparent text-text-muted hover:text-text-heading",
            )}
          >
            <tab.icon className="size-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
