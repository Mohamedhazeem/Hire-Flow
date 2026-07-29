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

const WORKMODE_COLORS: Record<string, string> = {
  remote: "#22c55e",
  hybrid: "#a855f7",
  onsite: "#f97316",
};

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "var(--color-bg-surface)",
    border: "1px solid var(--color-border-subtle)",
    borderRadius: "12px",
    boxShadow: "var(--shadow-md)",
    fontSize: "12px",
  },
};

type WorkModeBarChartProps = {
  data: { workMode: string; count: number }[];
};

export function WorkModeBarChart({ data }: WorkModeBarChartProps) {
  if (data.length === 0)
    return <p className="text-text-muted text-sm py-12 text-center">No jobs posted yet</p>;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barCategoryGap="20%">
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--color-border-subtle)"
          strokeOpacity={0.5}
          vertical={false}
        />
        <XAxis
          dataKey="workMode"
          tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
          tickFormatter={(val: string) => val.charAt(0).toUpperCase() + val.slice(1)}
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
          dataKey="count"
          radius={[6, 6, 0, 0]}
          barSize={40}
          shape={(props: BarShapeProps) => {
            const color =
              WORKMODE_COLORS[(props.payload as { workMode: string })?.workMode] ?? "#6b7280";
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
  );
}
