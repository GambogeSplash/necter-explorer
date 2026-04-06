import {
  Skeleton,
  StatCardSkeleton,
  ChartSkeleton,
  TableRowSkeleton,
} from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="px-2.5 py-4 space-y-4">
      {/* Title */}
      <div>
        <Skeleton className="h-6 w-56 mb-1.5" />
        <Skeleton className="h-3 w-64" />
      </div>

      {/* Stat cards — 4 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Tab switcher placeholder */}
      <Skeleton className="h-9 w-56 rounded-lg" />

      {/* Table */}
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-2.5 border-b border-border">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-2.5 flex-1" />
          ))}
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <TableRowSkeleton key={i} cols={7} />
        ))}
      </div>

      {/* Pagination placeholder */}
      <div className="flex justify-center">
        <Skeleton className="h-3 w-40" />
      </div>
    </div>
  );
}
