import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      className={cn('rounded-xl bg-muted', className)}
      style={style}
      animate={{ opacity: [0.4, 0.65, 0.4] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

export { Skeleton };
