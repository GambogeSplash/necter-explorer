"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Box, Clock, Activity, Fuel } from "lucide-react";
import { HashLink } from "@/components/hash-link";
import { MobileCard } from "@/components/mobile-card";
import { StatCard } from "@/components/stat-card";
import { TimeAgo } from "@/components/time-ago";
import { Pagination } from "@/components/pagination";
import { SortableHeader } from "@/components/sortable-header";
import { blocksExtended } from "@/lib/mock-data";
import { PageTitle } from "@/components/page-title";

type SortKey = "height" | "txCount" | "gasUsed";
type SortDir = "asc" | "desc";

function gasColor(pct: number) {
  if (pct > 80) return "bg-[#FFC933]";
  if (pct > 60) return "bg-[#22C55E]";
  return "bg-muted-foreground/40";
}

export default function BlocksPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir | null>(null);

  // Live indicator: simulated tick for "block height" growing
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((p) => p + 1), 6000);
    return () => clearInterval(i);
  }, []);

  function handleSort(key: string) {
    const k = key as SortKey;
    if (sortKey === k) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(k);
      setSortDir("desc");
    }
    setPage(1);
  }

  // Derived stats
  const latestHeight = blocksExtended[0].height + tick;
  const avgBlockTime = "2.4s";
  const totalToday = (blocksExtended.length * 32).toLocaleString();
  const avgGasUsed = (
    blocksExtended.reduce((s, b) => s + b.gasUsed, 0) /
    blocksExtended.length /
    1_000_000
  ).toFixed(1);

  const sorted = useMemo(() => {
    const data = [...blocksExtended];
    if (sortKey && sortDir) {
      data.sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        return sortDir === "asc"
          ? (av as number) - (bv as number)
          : (bv as number) - (av as number);
      });
    }
    return data;
  }, [sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="max-w-[1480px] mx-auto px-2.5 py-2 space-y-4">
      <PageTitle title="Blocks" />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Blocks</h1>
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-60 animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
          </span>
          <span className="font-mono-data tabular-nums">#{latestHeight.toLocaleString()}</span>
          <span>latest height</span>
        </div>
      </div>

      {/* Stats — shared StatCard component */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Latest Height"
          value={`#${latestHeight.toLocaleString()}`}
          change="+1 just now"
          trend="up"
          icon={Box}
        />
        <StatCard
          title="Avg Block Time"
          value={avgBlockTime}
          change="-0.1s"
          trend="up"
          icon={Clock}
        />
        <StatCard
          title="Blocks Today"
          value={totalToday}
          change="+2,847"
          trend="up"
          icon={Activity}
        />
        <StatCard
          title="Avg Gas Used"
          value={`${avgGasUsed}M`}
          change="+8.4%"
          trend="up"
          icon={Fuel}
        />
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {paginated.map((block) => {
          const gasPct = ((block.gasUsed / block.gasLimit) * 100);
          return (
            <MobileCard
              key={block.height}
              onClick={() => router.push(`/blocks/${block.height}`)}
              rows={[
                { label: "Block", value: <span className="font-mono-data text-primary">#{block.height.toLocaleString()}</span> },
                { label: "Txs", value: <span className="font-mono-data">{block.txCount}</span> },
                { label: "Gas", value: <span className="font-mono-data">{gasPct.toFixed(1)}%</span> },
                { label: "Reward", value: <span className="font-mono-data">{block.reward} NECTA</span> },
                { label: "Time", value: <TimeAgo timestamp={block.timestamp} /> },
              ]}
            />
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-lg bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-2.5 text-left">
                  <SortableHeader label="Height" sortKey="height" currentSort={sortKey} direction={sortDir} onSort={handleSort} />
                </th>
                <th className="px-5 py-2.5 text-left text-[11px] text-muted-foreground uppercase tracking-wider font-normal">Hash</th>
                <th className="px-5 py-2.5 text-left text-[11px] text-muted-foreground uppercase tracking-wider font-normal">Time</th>
                <th className="px-5 py-2.5 text-left text-[11px] text-muted-foreground uppercase tracking-wider font-normal">Proposer</th>
                <th className="px-5 py-2.5 text-right">
                  <SortableHeader label="Txs" sortKey="txCount" currentSort={sortKey} direction={sortDir} onSort={handleSort} />
                </th>
                <th className="px-5 py-2.5 text-right">
                  <SortableHeader label="Gas Used" sortKey="gasUsed" currentSort={sortKey} direction={sortDir} onSort={handleSort} />
                </th>
                <th className="px-5 py-2.5 text-right text-[11px] text-muted-foreground uppercase tracking-wider font-normal">Reward</th>
                <th className="px-5 py-2.5 text-right text-[11px] text-muted-foreground uppercase tracking-wider font-normal">ZK</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((block) => {
                const utilization = (block.gasUsed / block.gasLimit) * 100;
                return (
                  <tr key={block.height} className="border-b border-border last:border-0 row-hover-gold">
                    <td className="px-5 py-2.5">
                      <Link href={`/blocks/${block.height}`} className="font-mono-data text-foreground hover:text-primary transition-colors">
                        #{block.height.toLocaleString()}
                      </Link>
                    </td>
                    <td className="px-5 py-2.5">
                      <HashLink hash={block.hash} type="block" />
                    </td>
                    <td className="px-5 py-2.5">
                      <TimeAgo timestamp={block.timestamp} />
                    </td>
                    <td className="px-5 py-2.5">
                      <HashLink hash={block.proposer} type="address" />
                    </td>
                    <td className="px-5 py-2.5 text-right font-mono-data text-muted-foreground">
                      {block.txCount}
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-mono-data text-muted-foreground">
                          {(block.gasUsed / 1_000_000).toFixed(1)}M
                        </span>
                        <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${gasColor(utilization)}`}
                            style={{ width: `${Math.min(utilization, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-2.5 text-right font-mono-data text-muted-foreground">
                      {block.reward} NECTA
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <span className="inline-flex px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-[#6E9FFF]/10 text-[#6E9FFF]">
                        Verified
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        pageSize={pageSize}
        totalItems={sorted.length}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
      />
    </div>
  );
}
