import * as TabsPrimitive from '@radix-ui/react-tabs';
import { type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;

function TabsList({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        'inline-flex items-center gap-1 rounded-2xl bg-muted/50 p-1.5 border border-border/30 backdrop-blur-md shadow-2xs',
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-muted-foreground transition-all duration-300 ease-out cursor-pointer select-none',
        'hover:text-foreground hover:scale-[1.01]',
        'data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.02)] data-[state=active]:border-border/20 data-[state=active]:scale-[1.02]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        'disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97]',
        'border border-transparent',
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn(
        'mt-4 focus-visible:outline-none transition-all duration-300 ease-out',
        className
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
