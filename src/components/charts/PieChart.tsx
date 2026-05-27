import { motion } from "motion/react";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import { SPRING_TRANSITION } from "@/lib/constants";

interface PieDataItem {
  name: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieDataItem[];
  title?: string;
}

function ChartTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-popover/90 backdrop-blur-xl px-3 py-2 shadow-lg">
      <p className="text-[11px] text-muted-foreground mb-0.5">{payload[0].name}</p>
      <p className="text-sm font-semibold text-foreground">{payload[0].value}</p>
    </div>
  );
}

export function LuxPieChart({ data, title }: PieChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={SPRING_TRANSITION}
      className="rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-6"
    >
      {title && <p className="text-sm font-semibold text-foreground mb-6">{title}</p>}
      <ResponsiveContainer width="100%" height={200}>
        <RechartsPie>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>{value}</span>
            )}
          />
        </RechartsPie>
      </ResponsiveContainer>
    </motion.div>
  );
}
