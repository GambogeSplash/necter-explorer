import {
  Skeleton,
  StatCardSkeleton,
  ChartSkeleton,
  ListCardSkeleton,
  InfoCardSkeleton,
} from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="max-w-[1480px] mx-auto px-2.5 py-4 space-y-4">
      {/* Hero Banner */}
      <Skeleton className="h-[140px] w-full rounded-lg" />

      {/* Health Score */}
      <Skeleton className="h-[72px] w-full rounded-lg" />

      {/* Hero Stats — 6 cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts — 2 cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Latest Blocks & Transactions — 2 list cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ListCardSkeleton rows={8} />
        <ListCardSkeleton rows={8} />
      </div>

      {/* Bottom Row — 3 info cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <InfoCardSkeleton rows={4} />
        <InfoCardSkeleton rows={4} />
        <InfoCardSkeleton rows={3} />
      </div>
    </div>
  );
}
