import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(0,122,255)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 cursor-pointer select-none',
  {
    variants: {
      variant: {
        default:
          'bg-[#1d1d1f] text-white hover:bg-[#2d2d2f] active:scale-[0.98] dark:bg-white dark:text-[#1d1d1f] dark:hover:bg-white/90',
        secondary:
          'bg-white/40 text-[#1d1d1f] border border-black/10 hover:bg-white/60 active:scale-[0.98] dark:bg-white/10 dark:text-white dark:border-white/10 dark:hover:bg-white/15',
        ghost:
          'bg-transparent text-[#1d1d1f] hover:bg-black/5 active:scale-[0.98] dark:text-white dark:hover:bg-white/8',
        destructive:
          'bg-[rgba(255,69,58,0.12)] text-[rgb(255,69,58)] border border-[rgba(255,69,58,0.2)] hover:bg-[rgba(255,69,58,0.18)] active:scale-[0.98]',
        info:
          'bg-[rgba(0,122,255,0.12)] text-[rgb(0,122,255)] border border-[rgba(0,122,255,0.2)] hover:bg-[rgba(0,122,255,0.18)] active:scale-[0.98]',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-lg',
        md: 'h-9 px-4',
        lg: 'h-11 px-6 text-base rounded-2xl',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
