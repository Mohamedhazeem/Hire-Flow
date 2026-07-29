"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { format, isValid, parse } from "date-fns";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DateRangeValue = {
  from?: string;
  to?: string;
};

type DateRangePickerProps = {
  value: DateRangeValue;
  onChange: (range: DateRangeValue) => void;
  placeholder?: string;
  className?: string;
};

function parseDate(str: string): Date | undefined {
  const parsed = parse(str, "yyyy-MM-dd", new Date());
  return isValid(parsed) ? parsed : undefined;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Select dates...",
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const fromDate = value.from ? parseDate(value.from) : undefined;
  const toDate = value.to ? parseDate(value.to) : undefined;

  const [tempRange, setTempRange] = React.useState<{ from?: Date; to?: Date }>({
    from: fromDate,
    to: toDate,
  });

  const hasRange = value.from || value.to;

  const displayText = React.useMemo(() => {
    if (value.from && value.to) {
      return `${format(parseDate(value.from)!, "MMM d, yyyy")} - ${format(parseDate(value.to)!, "MMM d, yyyy")}`;
    }
    if (value.from) {
      return `From ${format(parseDate(value.from)!, "MMM d, yyyy")}`;
    }
    if (value.to) {
      return `Until ${format(parseDate(value.to)!, "MMM d, yyyy")}`;
    }
    return null;
  }, [value.from, value.to]);

  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range || (!range.from && !range.to)) {
      setTempRange({});
      return;
    }
    setTempRange({ from: range.from, to: range.to });
  };

  const handleApply = () => {
    if (tempRange.from && tempRange.to) {
      const fromStr = format(tempRange.from, "yyyy-MM-dd");
      const toStr = format(tempRange.to, "yyyy-MM-dd");
      onChange({ from: fromStr, to: toStr });
    } else if (tempRange.from) {
      const fromStr = format(tempRange.from, "yyyy-MM-dd");
      onChange({ from: fromStr, to: fromStr });
    } else {
      onChange({});
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({});
    setTempRange({});
  };

  const hasTempRange = tempRange.from || tempRange.to;

  return (
    <Popover
      open={open}
      onOpenChange={(newOpen) => {
        if (newOpen) {
          setTempRange({ from: fromDate, to: toDate });
        }
        setOpen(newOpen);
      }}
    >
      <PopoverTrigger>
        <div
          className={cn(
            "group flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg border bg-background px-3 text-sm text-text-body transition-all hover:bg-bg-subtle",
            hasRange ? "border-brand/50 bg-brand/5" : "border-border dark:border-border/60",
            !hasRange && "text-text-muted",
            className,
          )}
        >
          <CalendarIcon className="size-3.5 shrink-0 text-text-muted group-hover:text-text-body transition-colors" />
          <span className="truncate min-w-0">{displayText ?? placeholder}</span>
          {hasRange && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClear(e as unknown as React.MouseEvent);
                }
              }}
              className="ml-auto shrink-0 rounded p-0.5 text-text-muted hover:text-text-heading hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Clear date range"
            >
              <XIcon className="size-3" />
            </span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" side="bottom" sideOffset={8} className="w-auto p-0">
        <DayPicker
          mode="range"
          selected={{ from: tempRange.from, to: tempRange.to }}
          onSelect={handleSelect}
          numberOfMonths={2}
          pagedNavigation
          showOutsideDays={false}
          classNames={{
            root: "p-3",
            months: "flex flex-col sm:flex-row gap-4",
            month: "space-y-2",
            month_caption: "flex justify-center items-center h-9 relative",
            caption_label: "text-sm font-medium",
            nav: "flex items-center gap-1 absolute right-0",
            button_previous: cn(
              "inline-flex items-center justify-center size-7 rounded-md text-text-muted hover:text-text-body hover:bg-bg-elevated transition-colors [&>svg]:size-4",
            ),
            button_next: cn(
              "inline-flex items-center justify-center size-7 rounded-md text-text-muted hover:text-text-body hover:bg-bg-elevated transition-colors [&>svg]:size-4",
            ),
            weekday:
              "text-text-muted font-medium text-[0.65rem] uppercase tracking-wider w-[36px] text-center",
            weekdays: "flex",
            week: "flex w-full mt-1",
            day_button: cn(
              "inline-flex items-center justify-center size-8 rounded-md text-sm font-normal text-text-body hover:bg-bg-elevated transition-colors",
              "dark:hover:bg-brand-dark",
              "w-[36px]",
            ),
            day: "text-center p-0",
            today: "font-semibold text-brand",
            selected: "bg-brand text-brand-foreground hover:bg-brand-dark rounded-md",
            range_start: "bg-brand/80 text-brand-foreground rounded-r-none",
            range_end: "bg-brand text-brand-foreground rounded-l-none",
            range_middle: cn("bg-brand/10 text-brand rounded-none", "dark:bg-brand/10"),
            outside: "text-text-muted opacity-30 pointer-events-none",
            disabled: "text-text-muted opacity-30 pointer-events-none",
          }}
          components={{
            Chevron: ({ orientation, className }) => {
              if (orientation === "left") {
                return <ChevronLeftIcon className={cn("size-4", className)} />;
              }
              return <ChevronRightIcon className={cn("size-4", className)} />;
            },
          }}
        />
        <div className="flex items-center gap-2 border-t border-border-subtle p-3">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              onChange({});
              setTempRange({});
              setOpen(false);
            }}
            className="text-text-muted hover:text-text-body"
          >
            Clear
          </Button>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setOpen(false)}
            className="text-text-muted hover:text-text-body"
          >
            Cancel
          </Button>
          <Button size="xs" onClick={handleApply} disabled={!hasTempRange}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
