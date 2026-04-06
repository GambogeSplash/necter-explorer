export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-secondary ${className ?? ""}`}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
      <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
      <div className="min-w-0 flex-1">
        <Skeleton className="h-3 w-20 mb-2" />
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols }: { cols: number }) {
  return (
    <div className="flex items-center gap-3 px-5 py-2.5 border-b border-border last:border-0">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3.5 flex-1 ${i === 0 ? "max-w-[80px]" : ""}`}
        />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-lg bg-card border border-border p-5">
      <Skeleton className="h-3 w-40 mb-4" />
      <Skeleton className="h-[180px] w-full rounded-lg" />
    </div>
  );
}

export function ListCardSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="rounded-lg bg-card border border-border overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-16" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between px-5 py-2.5 border-b border-border last:border-0"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-7 rounded-lg" />
            <div>
              <Skeleton className="h-3.5 w-24 mb-1.5" />
              <Skeleton className="h-2.5 w-32" />
            </div>
          </div>
          <Skeleton className="h-3 w-14" />
        </div>
      ))}
    </div>
  );
}

export function InfoCardSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="rounded-lg bg-card border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3.5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
