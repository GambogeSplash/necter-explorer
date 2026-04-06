import { Skeleton, TableRowSkeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="px-2.5 py-4 space-y-4">
      {/* Title */}
      <div>
        <Skeleton className="h-6 w-32 mb-1.5" />
        <Skeleton className="h-3 w-56" />
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-28 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-lg" />
        <Skeleton className="h-9 w-20 rounded-lg" />
      </div>

      {/* Table */}
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        {/* Header row */}
        <div className="flex items-center gap-3 px-5 py-2.5 border-b border-border">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-2.5 flex-1" />
          ))}
        </div>
        {/* 10 data rows */}
        {Array.from({ length: 10 }).map((_, i) => (
          <TableRowSkeleton key={i} cols={8} />
        ))}
      </div>

      {/* Pagination placeholder */}
      <div className="flex justify-center">
        <Skeleton className="h-3 w-44" />
      </div>
    </div>
  );
}
