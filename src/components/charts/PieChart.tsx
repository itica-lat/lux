import { motion } from 'motion/react';
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { SPRING_TRANSITION } from '@/lib/constants';

interface PieDataItem {
  name: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieDataItem[];
  title?: string;
}

export function LuxPieChart({ data, title }: PieChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={SPRING_TRANSITION}
      className="rounded-2xl border border-black/8 dark:border-white/5 bg-white/40 dark:bg-[#0a0a0c]/40 backdrop-blur-xl p-6"
    >
      {title && (
        <p className="text-sm font-semibold text-[#1d1d1f] dark:text-white mb-6">{title}</p>
      )}
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
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid rgba(0,0,0,0.08)',
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              fontSize: '12px',
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span style={{ fontSize: '12px', color: '#86868b' }}>{value}</span>
            )}
          />
        </RechartsPie>
      </ResponsiveContainer>
    </motion.div>
  );
}
