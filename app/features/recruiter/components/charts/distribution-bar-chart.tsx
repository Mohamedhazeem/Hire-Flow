"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type BarShapeProps,
} from "recharts";
import { BarChart3Icon } from "lucide-react";
import { cn } from "@/lib/utils";

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "var(--color-bg-surface)",
    border: "1px solid var(--color-border-subtle)",
    borderRadius: "12px",
    boxShadow: "var(--shadow-md)",
    fontSize: "12px",
  },
};

type DistributionBarChartProps = {
  data: Array<{ label: string; value: number }>;
  colorMap: Record<string, string>;
  title: string;
  subtitle?: string;
  emptyMessage?: string;
  className?: string;
};

export function DistributionBarChart({ data, colorMap, title, subtitle, emptyMessage, className }: DistributionBarChartProps) {
  return (
    <div className={cn("rounded-2xl border border-border-subtle bg-bg-surface p-5 sm:p-6 shadow-xs h-full flex flex-col", className)}>
      <div className="flex items-center gap-2.5 mb-5">
        <div className="size-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
          <BarChart3Icon className="size-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text-heading">{title}</h2>
          {subtitle && <p className="text-[11px] text-text-muted">{subtitle}</p>}
        </div>
      </div>
      {data.length === 0 ? (
        <p className="text-text-muted text-sm py-12 text-center flex-1">{emptyMessage ?? "No data available"}</p>
      ) : (
        <ResponsiveContainer width="100%" height="100%" className="flex-1 min-h-0">
          <BarChart data={data} barCategoryGap="20%">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border-subtle)"
              strokeOpacity={0.5}
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip {...CHART_TOOLTIP_STYLE} cursor={false} />
            <Bar
              dataKey="value"
              radius={[6, 6, 0, 0]}
              barSize={40}
              shape={(props: BarShapeProps) => {
                const label = (props.payload as { label: string })?.label;
                const color = colorMap[label] ?? "#6b7280";
                return (
                  <rect
                    x={props.x}
                    y={props.y}
                    width={props.width}
                    height={props.height}
                    fill={color}
                    fillOpacity={0.9}
                    rx={6}
                    ry={6}
                  />
                );
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
