import { Skeleton } from "@/components/ui/skeleton";

export function WizardSkeleton() {
  return (
    <div className="flex gap-8 h-full">
      <div className="w-48 space-y-2 pt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-xl" />
        ))}
      </div>
      <div className="flex-1 space-y-6">
        <Skeleton className="h-6 w-48 rounded" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// Skeleton