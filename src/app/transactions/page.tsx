"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Fuel, Clock, AlertTriangle } from "lucide-react";
import { HashLink } from "@/components/hash-link";
import { MobileCard } from "@/components/mobile-card";
import { StatCard } from "@/components/stat-card";
import { TimeAgo } from "@/components/time-ago";
import { StatusBadge } from "@/components/status-badge";
import { Pagination } from "@/components/pagination";
import { SortableHeader } from "@/components/sortable-header";
import { FilterBar, type FilterConfig } from "@/components/filter-bar";
import { transactionsExtended } from "@/lib/mock-data";
import { PageTitle } from "@/components/page-title";

type SortKey = "blockNumber" | "value" | "fee" | "timestamp";
type SortDir = "asc" | "desc";

const filterConfigs: FilterConfig[] = [
  {
    key: "type",
    label: "All Types",
    type: "select",
    options: [
      { value: "transfer", label: "Transfer" },
      { value: "contract_call", label: "Contract Call" },
      { value: "job_post", label: "Job Post" },
      { value: "attestation", label: "Attestation" },
      { value: "stake", label: "Stake" },
      { value: "governance", label: "Governance" },
    ],
  },
  {
    key: "status",
    label: "All Statuses",
    type: "select",
    options: [
      { value: "confirmed", label: "Confirmed" },
      { value: "pending", label: "Pending" },
      { value: "failed", label: "Failed" },
    ],
  },
];

export default function TransactionsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir | null>(null);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((p) => p + 1), 5000);
    return () => clearInterval(i);
  }, []);

  // Derived stats
  const total24h = transactionsExtended.length * 18 + tick;
  const avgFee = (
    transactionsExtended.reduce((s, tx) => s + parseFloat(tx.fee), 0) /
    transactionsExtended.length
  ).toFixed(5);
  const pendingCount = transactionsExtended.filter((tx) => tx.status === "pending").length;
  const failedCount = transactionsExtended.filter((tx) => tx.status === "failed").length;
  const failedRate = ((failedCount / transactionsExtended.length) * 100).toFixed(2);

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

  function handleFilterChange(key: string, value: string) {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }

  function handleFilterClear() {
    setFilterValues({});
    setPage(1);
  }

  const processed = useMemo(() => {
    let data = [...transactionsExtended];

    // Filter
    if (filterValues.type) {
      data = data.filter((tx) => tx.type === filterValues.type);
    }
    if (filterValues.status) {
      data = data.filter((tx) => tx.status === filterValues.status);
    }

    // Sort
    if (sortKey && sortDir) {
      data.sort((a, b) => {
        let av: number, bv: number;
        switch (sortKey) {
          case "blockNumber":
            av = a.blockNumber; bv = b.blockNumber; break;
          case "value":
            av = parseFloat(a.value); bv = parseFloat(b.value); break;
          case "fee":
            av = parseFloat(a.fee); bv = parseFloat(b.fee); break;
          case "timestamp":
            av = new Date(a.timestamp).getTime(); bv = new Date(b.timestamp).getTime(); break;
          default:
            return 0;
        }
        return sortDir === "asc" ? av - bv : bv - av;
      });
    }

    return data;
  }, [sortKey, sortDir, filterValues]);

  const totalPages = Math.ceil(processed.length / pageSize);
  const paginated = processed.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="max-w-[1480px] mx-auto px-2.5 py-2 space-y-4">
      <PageTitle title="Transactions" />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Transactions</h1>
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-60 animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
          </span>
          <span className="font-mono-data tabular-nums">{total24h.toLocaleString()}</span>
          <span>tx in 24h</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total 24h"
          value={total24h.toLocaleString()}
          change="+12.4%"
          trend="up"
          icon={ArrowLeftRight}
        />
        <StatCard
          title="Avg Fee"
          value={`${avgFee}`}
          change="-2.1%"
          trend="up"
          icon={Fuel}
        />
        <StatCard
          title="Pending"
          value={pendingCount.toString()}
          change="+3"
          trend="down"
          icon={Clock}
        />
        <StatCard
          title="Failed Rate"
          value={`${failedRate}%`}
          change="-0.4%"
          trend="up"
          icon={AlertTriangle}
        />
      </div>

      <FilterBar
        filters={filterConfigs}
        values={filterValues}
        onChange={handleFilterChange}
        onClear={handleFilterClear}
      />

      {/* Empty state */}
      {paginated.length === 0 && (
        <div className="rounded-lg border border-border bg-card px-5 py-12 text-center">
          <p className="text-sm text-muted-foreground">No transactions match your filters.</p>
          <button
            onClick={handleFilterClear}
            className="mt-2 text-[11px] text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {paginated.map((tx) => (
          <MobileCard
            key={tx.hash}
            onClick={() => router.push(`/tx/${tx.hash}`)}
            rows={[
              { label: "Hash", value: <span className="font-mono-data text-primary text-xs">{tx.hash.slice(0, 14)}...</span> },
              { label: "Type", value: <StatusBadge status={tx.type.replace("_", " ")} /> },
              { label: "Value", value: <span className="font-mono-data">{parseFloat(tx.value).toLocaleString()} NECTA</span> },
              { label: "Fee", value: <span className="font-mono-data text-muted-foreground">{tx.fee}</span> },
              { label: "Time", value: <TimeAgo timestamp={tx.timestamp} /> },
            ]}
          />
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-lg bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-2.5 text-left text-[11px] text-muted-foreground uppercase tracking-wider font-normal">Hash</th>
                <th className="px-5 py-2.5 text-left">
                  <SortableHeader label="Block" sortKey="blockNumber" currentSort={sortKey} direction={sortDir} onSort={handleSort} />
                </th>
                <th className="px-5 py-2.5 text-left text-[11px] text-muted-foreground uppercase tracking-wider font-normal">From</th>
                <th className="px-5 py-2.5 text-left text-[11px] text-muted-foreground uppercase tracking-wider font-normal">To</th>
                <th className="px-5 py-2.5 text-left text-[11px] text-muted-foreground uppercase tracking-wider font-normal">Type</th>
                <th className="px-5 py-2.5 text-right">
                  <SortableHeader label="Value" sortKey="value" currentSort={sortKey} direction={sortDir} onSort={handleSort} />
                </th>
                <th className="px-5 py-2.5 text-right">
                  <SortableHeader label="Fee" sortKey="fee" currentSort={sortKey} direction={sortDir} onSort={handleSort} />
                </th>
                <th className="px-5 py-2.5 text-right">
                  <SortableHeader label="Time" sortKey="timestamp" currentSort={sortKey} direction={sortDir} onSort={handleSort} />
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((tx) => (
                <tr key={tx.hash} className="border-b border-border last:border-0 hover:bg-secondary transition-colors">
                  <td className="px-5 py-2.5">
                    <HashLink hash={tx.hash} type="tx" />
                  </td>
                  <td className="px-5 py-2.5">
                    <Link href={`/blocks/${tx.blockNumber}`} className="font-mono-data text-muted-foreground hover:text-primary transition-colors text-xs">
                      #{tx.blockNumber.toLocaleString()}
                    </Link>
                  </td>
                  <td className="px-5 py-2.5">
                    <HashLink hash={tx.from} type="address" />
                  </td>
                  <td className="px-5 py-2.5">
                    <HashLink hash={tx.to} type="address" />
                  </td>
                  <td className="px-5 py-2.5">
                    <StatusBadge status={tx.type.replace("_", " ")} />
                  </td>
                  <td className="px-5 py-2.5 text-right font-mono-data">
                    {tx.value}
                  </td>
                  <td className="px-5 py-2.5 text-right font-mono-data text-muted-foreground text-xs">
                    {tx.fee}
                  </td>
                  <td className="px-5 py-2.5 text-right">
                    <TimeAgo timestamp={tx.timestamp} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        pageSize={pageSize}
        totalItems={processed.length}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
      />
    </div>
  );
}
