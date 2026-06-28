"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { format, isAfter, isBefore, isValid, parse } from "date-fns";
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

export function DateRangePicker({ value, onChange, placeholder = "Select dates...", className }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const fromDate = value.from ? parseDate(value.from) : undefined;
  const toDate = value.to ? parseDate(value.to) : undefined;

  const [tempRange, setTempRange] = React.useState<{ from?: Date; to?: Date }>({
    from: fromDate,
    to: toDate,
  });

  React.useEffect(() => {
    if (open) {
      setTempRange({ from: fromDate, to: toDate });
    }
  }, [open, value.from, value.to]);

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
    setTempRange(range);

    if (range.from && range.to) {
      const fromStr = format(range.from, "yyyy-MM-dd");
      const toStr = format(range.to, "yyyy-MM-dd");
      onChange({ from: fromStr, to: toStr });
      setOpen(false);
    } else if (range.from) {
      setTempRange({ from: range.from, to: undefined });
    }
  };

  const clearRange = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({});
    setTempRange({});
  };

  const applySingleDayRange = () => {
    if (tempRange.from && !tempRange.to) {
      const fromStr = format(tempRange.from, "yyyy-MM-dd");
      onChange({ from: fromStr, to: fromStr });
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={(open) => {
      if (!open) {
        setTempRange({ from: fromDate, to: toDate });
      }
      setOpen(open);
    }}>
      <PopoverTrigger>
        <div
          className={cn(
            "group flex h-9 w-full cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-2.5 text-sm text-text-body transition-all hover:border-border-strong focus-within:ring-2 focus-within:ring-brand/30",
            "dark:border-border/60 dark:hover:border-border dark:focus-within:border-brand/60",
            !hasRange && "text-text-muted",
            className,
          )}
        >
          <CalendarIcon className="size-3.5 shrink-0 text-text-muted group-hover:text-text-body transition-colors" />
          <span className="truncate min-w-0">{displayText ?? placeholder}</span>
          {hasRange && (
            <button
              type="button"
              onClick={clearRange}
              className="ml-auto shrink-0 rounded p-0.5 text-text-muted hover:text-text-body hover:bg-bg-elevated transition-colors"
              aria-label="Clear date range"
            >
              <XIcon className="size-3" />
            </button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={8}
        className="w-auto p-0"
      >
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
            weekday: "text-text-muted font-medium text-[0.65rem] uppercase tracking-wider",
            weekdays: "flex",
            week: "flex w-full mt-1",
            day_button: cn(
              "inline-flex items-center justify-center size-8 rounded-md text-sm font-normal text-text-body hover:bg-bg-elevated transition-colors",
              "dark:hover:bg-neutral-800",
            ),
            day: "text-center p-0",
            today: "font-semibold text-brand",
            selected: "bg-brand text-brand-foreground hover:bg-brand-dark rounded-md",
            range_start: "bg-brand text-brand-foreground rounded-r-none",
            range_end: "bg-brand text-brand-foreground rounded-l-none",
            range_middle: cn(
              "bg-brand/10 text-brand rounded-none",
              "dark:bg-brand/20",
            ),
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
          {tempRange.from && !tempRange.to && (
            <Button
              size="xs"
              onClick={applySingleDayRange}
            >
              Apply
            </Button>
          )}
          {tempRange.from && tempRange.to && (
            <Button
              size="xs"
              onClick={() => {
                const fromStr = format(tempRange.from!, "yyyy-MM-dd");
                const toStr = format(tempRange.to!, "yyyy-MM-dd");
                onChange({ from: fromStr, to: toStr });
                setOpen(false);
              }}
            >
              Apply
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
