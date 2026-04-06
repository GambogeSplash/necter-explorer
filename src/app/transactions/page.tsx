"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HashLink } from "@/components/hash-link";
import { MobileCard } from "@/components/mobile-card";
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
    <div className="px-2.5 py-2 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">Transactions</h1>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-secondary text-muted-foreground">
            {processed.length.toLocaleString()}
          </span>
        </div>
      </div>

      <FilterBar
        filters={filterConfigs}
        values={filterValues}
        onChange={handleFilterChange}
        onClear={handleFilterClear}
      />

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
