"use client";

import { cn } from "@/lib/utils";
import { CHART_COLORS, FUNNEL_STAGE_ORDER } from "../../schema/analytics.schema";

type FunnelStage = { stage: string; count: number };

type FunnelChartProps = {
  current: FunnelStage[];
  historical: Array<{ stage: string; uniqueApplications: number }>;
  emptyMessage?: string;
};

function FunnelRow({ label, count, maxCount, color, dropOff, isHistorical }: {
  label: string;
  count: number;
  maxCount: number;
  color: string;
  dropOff: string;
  isHistorical?: boolean;
}) {
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-32 shrink-0">
        <span className="text-xs font-medium text-text-heading capitalize">
          {label.replace(/_/g, " ")}
        </span>
      </div>
      <div className="w-16 shrink-0 text-right">
        <span className="text-xs font-semibold text-text-body tabular-nums">
          {count}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="w-full h-5 rounded-md bg-bg-elevated overflow-hidden">
          <div
            className="h-full rounded-md transition-all duration-500"
            style={{ width: `${Math.max(pct, 1)}%`, backgroundColor: color, opacity: isHistorical ? 0.7 : 0.9 }}
          />
        </div>
      </div>
      <div className="w-16 shrink-0 text-right">
        <span className={cn(
          "text-xs tabular-nums",
          dropOff.startsWith("-") ? "text-error" : dropOff === "—" ? "text-text-muted" : "text-success",
        )}>
          {dropOff}
        </span>
      </div>
    </div>
  );
}

export function FunnelChart({ current, historical, emptyMessage }: FunnelChartProps) {
  const currentMap = new Map(current.map((s) => [s.stage, s.count]));
  const historicalMap = new Map(historical.map((s) => [s.stage, s.uniqueApplications]));

  const currentMax = Math.max(...current.map((s) => s.count), 1);
  const historicalMax = Math.max(...historical.map((s) => s.uniqueApplications), 1);

  if (current.length === 0) {
    return (
      <div className="rounded-2xl border border-border-subtle bg-bg-surface p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="size-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M4 20h16M4 20V4m0 16l6-12 4 8 4-6 2 4" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-heading">Pipeline Funnel</h2>
            <p className="text-[11px] text-text-muted">Stage-by-stage breakdown</p>
          </div>
        </div>
        <p className="text-text-muted text-sm py-12 text-center">{emptyMessage ?? "No pipeline data available"}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-surface p-5 sm:p-6 shadow-xs">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="size-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M4 20h16M4 20V4m0 16l6-12 4 8 4-6 2 4" />
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text-heading">Pipeline Funnel</h2>
          <p className="text-[11px] text-text-muted">Stage-by-stage breakdown</p>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-3 pb-1 border-b border-border-subtle mb-2">
          <div className="w-32 shrink-0" />
          <div className="w-16 shrink-0 text-right">
            <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Current</span>
          </div>
          <div className="flex-1" />
          <div className="w-16 shrink-0 text-right">
            <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Drop-off</span>
          </div>
        </div>

        {FUNNEL_STAGE_ORDER.map((stage, i) => {
          const count = currentMap.get(stage) ?? 0;
          const prevCount = i > 0 ? (currentMap.get(FUNNEL_STAGE_ORDER[i - 1]) ?? 0) : count;
          const dropOff = prevCount > 0
            ? `-${((1 - count / prevCount) * 100).toFixed(1)}%`
            : count > 0 ? "0.0%" : "—";
          const color = CHART_COLORS[stage] ?? "#6b7280";

          return (
            <FunnelRow
              key={stage}
              label={stage}
              count={count}
              maxCount={currentMax}
              color={color}
              dropOff={dropOff}
            />
          );
        })}
      </div>

      {historical.length > 0 && (
        <>
          <div className="mt-6 pt-4 border-t border-border-subtle">
            <div className="flex items-center gap-3 pb-1 border-b border-border-subtle mb-2">
              <div className="w-32 shrink-0" />
              <div className="w-16 shrink-0 text-right">
                <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Historical</span>
              </div>
              <div className="flex-1" />
              <div className="w-16 shrink-0 text-right">
                <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Drop-off</span>
              </div>
            </div>

            {FUNNEL_STAGE_ORDER.map((stage, i) => {
              const count = historicalMap.get(stage) ?? 0;
              const prevCount = i > 0 ? (historicalMap.get(FUNNEL_STAGE_ORDER[i - 1]) ?? 0) : count;
              const dropOff = prevCount > 0
                ? `-${((1 - count / prevCount) * 100).toFixed(1)}%`
                : count > 0 ? "0.0%" : "—";
              const color = CHART_COLORS[stage] ?? "#6b7280";

              return (
                <FunnelRow
                  key={`historical-${stage}`}
                  label={stage}
                  count={count}
                  maxCount={historicalMax}
                  color={color}
                  dropOff={dropOff}
                  isHistorical
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
