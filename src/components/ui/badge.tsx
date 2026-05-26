import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type BadgeColor = 'success' | 'warning' | 'info' | 'destructive' | 'muted' | 'default';

const colorMap: Record<BadgeColor, string> = {
  success: 'bg-[rgba(52,199,89,0.12)] text-[rgb(52,199,89)] border-[rgba(52,199,89,0.2)]',
  warning: 'bg-[rgba(255,159,10,0.12)] text-[rgb(255,159,10)] border-[rgba(255,159,10,0.2)]',
  info: 'bg-[rgba(0,122,255,0.12)] text-[rgb(0,122,255)] border-[rgba(0,122,255,0.2)]',
  destructive: 'bg-[rgba(255,69,58,0.12)] text-[rgb(255,69,58)] border-[rgba(255,69,58,0.2)]',
  muted: 'bg-black/5 text-[#86868b] border-black/10 dark:bg-white/8 dark:text-[#86868b] dark:border-white/10',
  default: 'bg-black/8 text-[#1d1d1f] border-black/10 dark:bg-white/10 dark:text-white dark:border-white/10',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
}

function Badge({ className, color = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide',
        colorMap[color],
        className
      )}
      {...props}
    />
  );
}

export { Badge, type BadgeColor };
