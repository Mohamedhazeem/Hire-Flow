"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUpIcon } from "lucide-react";
import type { TrendPoint } from "../../schema/analytics.schema";

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "var(--color-bg-surface)",
    border: "1px solid var(--color-border-subtle)",
    borderRadius: "12px",
    boxShadow: "var(--shadow-md)",
    fontSize: "12px",
  },
};

type TrendChartProps = {
  data: TrendPoint[];
  color: string;
  title: string;
  subtitle?: string;
  gradientId: string;
  emptyMessage?: string;
};

export function TrendChart({ data, color, title, subtitle, gradientId, emptyMessage }: TrendChartProps) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-surface p-5 sm:p-6 shadow-xs h-full flex flex-col">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="size-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <TrendingUpIcon className="size-4" style={{ color }} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text-heading">{title}</h2>
          {subtitle && <p className="text-[11px] text-text-muted">{subtitle}</p>}
        </div>
      </div>
      {data.length === 0 ? (
        <p className="text-text-muted text-sm py-12 text-center flex-1">{emptyMessage ?? "No data available"}</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.15} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" strokeOpacity={0.5} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
              tickFormatter={(val: string) => {
                const d = new Date(val + "T00:00:00");
                return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
              }}
            />
            <YAxis tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} allowDecimals={false} />
            <Tooltip {...CHART_TOOLTIP_STYLE} />
            <Line
              type="monotone"
              dataKey="count"
              stroke={color}
              strokeWidth={2.5}
              dot={{ r: 4, fill: color, strokeWidth: 2, stroke: "var(--color-bg-surface)" }}
              activeDot={{
                r: 6,
                fill: color,
                strokeWidth: 2,
                stroke: "var(--color-bg-surface)",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
