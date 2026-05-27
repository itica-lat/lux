import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeColor = "success" | "warning" | "info" | "destructive" | "muted" | "default";

const colorMap: Record<BadgeColor, string> = {
  success: "bg-success/8 text-success border-success/20 dark:bg-success/12",
  warning: "bg-warning/8 text-warning border-warning/20 dark:bg-warning/12",
  info: "bg-info/8 text-info border-info/20 dark:bg-info/12",
  destructive: "bg-destructive/8 text-destructive border-destructive/20 dark:bg-destructive/12",
  muted: "bg-muted text-muted-foreground border-border/70 dark:bg-muted/20",
  default: "bg-primary/6 text-primary border-primary/15 dark:bg-primary/12 dark:text-primary/90",
};

const dotColorMap: Record<BadgeColor, string> = {
  success: "bg-success shadow-[0_0_8px_rgba(52,199,89,0.5)]",
  warning: "bg-warning shadow-[0_0_8px_rgba(255,159,10,0.5)]",
  info: "bg-info shadow-[0_0_8px_rgba(0,122,255,0.5)]",
  destructive: "bg-destructive shadow-[0_0_8px_rgba(202,44,33,0.5)]",
  muted: "bg-muted-foreground/60",
  default: "bg-primary/80",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
  withDot?: boolean;
}

function Badge({ className, color = "default", withDot = false, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-all duration-300",
        colorMap[color],
        className,
      )}
      {...props}
    >
      {withDot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full shrink-0 animate-pulse", dotColorMap[color])}
        />
      )}
      {children}
    </span>
  );
}

export { Badge, type BadgeColor };
