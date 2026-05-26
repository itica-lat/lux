import { motion } from 'motion/react';
import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { SPRING_TRANSITION } from '@/lib/constants';

interface BarDataItem {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarDataItem[];
  title?: string;
  color?: string;
}

export function LuxBarChart({ data, title, color = 'rgb(0,122,255)' }: BarChartProps) {
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
        <RechartsBar data={data.map(d => ({ name: d.label, value: d.value }))}>
          <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.04)" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#86868b' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#86868b' }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid rgba(0,0,0,0.08)',
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              fontSize: '12px',
            }}
            cursor={{ fill: 'rgba(0,0,0,0.03)' }}
          />
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
