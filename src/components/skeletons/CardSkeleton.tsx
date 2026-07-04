import { Skeleton } from "@/components/ui/skeleton";

interface CardSkeletonProps {
  count?: number;
}

export function MetricCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-6 space-y-3">
      <Skeleton className="h-3 w-24 rounded" />
      <Skeleton className="h-9 w-16 rounded" />
      <Skeleton className="h-3 w-32 rounded" />
    </div>
  );
}

export function CardSkeleton({ count = 4 }: CardSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <MetricCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-6">
      <Skeleton className="h-4 w-36 rounded mb-6" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}

// Skeleton de card