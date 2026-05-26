import * as LabelPrimitive from '@radix-ui/react-label';
import { type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

function Label({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn(
        'text-xs font-medium uppercase tracking-widest text-[#86868b] peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    />
  );
}

export { Label };
