import { type TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-xl border border-black/10 bg-white/50 px-3 py-2 text-sm text-[#1d1d1f] placeholder:text-[#86868b] resize-none',
          'transition-all duration-200',
          'focus:outline-none focus:border-[rgb(0,122,255)] focus:bg-white/70 focus:ring-4 focus:ring-[rgba(0,122,255,0.08)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder:text-[#86868b]',
          'dark:focus:border-[rgb(0,122,255)] dark:focus:bg-black/30 dark:focus:ring-[rgba(0,122,255,0.12)]',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
