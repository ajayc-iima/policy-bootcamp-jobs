import { cn } from "@/lib/utils";

/**
 * A neutral shimmering placeholder. Use while real data loads so the layout
 * doesn't jump and the screen never blanks to a lone spinner.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("rounded-md bg-gradient-to-r from-navy-100 via-navy-50 to-navy-100 bg-[length:200%_100%] animate-shimmer", className)}
      aria-hidden
    />
  );
}

/** A skeleton shaped like a JobCard, for list placeholders. */
export function JobCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-navy-100/60 shadow-elevation-1 p-4">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/3 mt-2" />
      <div className="mt-3 flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}
