import { motion } from "motion/react";
import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  type TooltipProps,
} from "recharts";
import { SPRING_TRANSITION } from "@/lib/constants";

interface BarDataItem {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarDataItem[];
  title?: string;
  color?: string;
}

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-popover/90 backdrop-blur-xl px-3 py-2 shadow-lg">
      <p className="text-[11px] text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-foreground">{payload[0].value}</p>
    </div>
  );
}

export function LuxBarChart({ data, title, color = "var(--primary)" }: BarChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={SPRING_TRANSITION}
      className="rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-6"
    >
      {title && <p className="text-sm font-semibold text-foreground mb-6">{title}</p>}
      <ResponsiveContainer width="100%" height={200}>
        <RechartsBar data={data.map((d) => ({ name: d.label, value: d.value }))}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.6} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.5 }} />
          <Bar
            dataKey="value"
            fill={color}
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
            animationBegin={0}
            animationDuration={800}
          />
        </RechartsBar>
      </ResponsiveContainer>
    </motion.div>
  );
}
