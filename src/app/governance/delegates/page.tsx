"use client";

import { useState } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { HashLink } from "@/components/hash-link";
import { TimeAgo } from "@/components/time-ago";
import { StatCard } from "@/components/stat-card";
import { Pagination } from "@/components/pagination";
import { MobileCard } from "@/components/mobile-card";

// ─── Mock Data ──────────────────────────────────────────────────────────────

const ANCHOR = new Date("2026-04-05T10:00:00.000Z").getTime();
const hour = 3600_000;
const day = 86400_000;
const ts = (offset: number) => new Date(ANCHOR - offset).toISOString();

const topDelegates = Array.from({ length: 8 }, (_, i) => ({
  rank: i + 1,
  address: `0x${(0xaa01 + i * 0x1a).toString(16).padStart(4, "0")}D4e5F6a7B8c9D0e1F2a3B4c5D6e7F8a9`,
  votingPower: [2_847_000, 1_924_000, 1_512_000, 1_104_000, 847_000, 632_000, 418_000, 305_000][i],
  percentOfTotal: [22.9, 15.5, 12.2, 8.9, 6.8, 5.1, 3.4, 2.5][i],
  delegators: [312, 247, 198, 156, 124, 89, 67, 42][i],
  proposalsVoted: [18, 16, 15, 14, 12, 11, 9, 7][i],
}));

const delegationActivity = Array.from({ length: 6 }, (_, i) => ({
  delegator: `0x${(0xf101 + i * 0x23).toString(16).padStart(4, "0")}A3b4C5d6E7f8A9b0C1d2E3f4A5b6C7d8`,
  delegate: `0x${(0xaa01 + (i % 4) * 0x1a).toString(16).padStart(4, "0")}D4e5F6a7B8c9D0e1F2a3B4c5D6e7F8a9`,
  amount: [125_000, 89_400, 45_200, 234_100, 67_800, 12_500][i],
  action: (i % 3 === 2 ? "undelegate" : "delegate") as "delegate" | "undelegate",
  timestamp: ts(i * hour * 4 + i * 1200),
}));

export default function DelegatesPage() {
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(topDelegates.length / pageSize);
  const pagedDelegates = topDelegates.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="px-2.5 py-2 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-secondary p-2">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Delegates</h1>
          <p className="text-xs text-muted-foreground">
            Voting power distribution and delegation activity
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatCard title="Total Delegates" value="247" icon={Users} />
        <StatCard title="Total Voting Power" value="12.4M NECTA" icon={Users} />
        <StatCard title="Active Delegations" value="1,847" icon={Users} />
      </div>

      {/* Top Delegates Table */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-2">
          Top Delegates
        </h2>
        <div className="hidden md:block rounded-lg bg-card border border-border overflow-hidden">
          <div className="grid grid-cols-[60px_1fr_140px_100px_100px_120px] gap-4 px-5 py-2.5 bg-secondary text-xs text-muted-foreground border-b border-border">
            <span>Rank</span>
            <span>Address</span>
            <span className="text-right">Voting Power</span>
            <span className="text-right">% of Total</span>
            <span className="text-right">Delegators</span>
            <span className="text-right">Proposals Voted</span>
          </div>
          {pagedDelegates.map((d) => (
            <div
              key={d.rank}
              className="row-hover grid grid-cols-[60px_1fr_140px_100px_100px_120px] gap-4 px-5 py-2.5 border-b border-border last:border-0 items-center"
            >
              <span className="font-mono-data text-sm font-medium">
                #{d.rank}
              </span>
              <HashLink hash={d.address} type="address" />
              <span className="text-right font-mono-data text-xs">
                {(d.votingPower / 1_000_000).toFixed(2)}M NECTA
              </span>
              <span className="text-right font-mono-data text-xs text-muted-foreground">
                {d.percentOfTotal}%
              </span>
              <span className="text-right font-mono-data text-xs">
                {d.delegators}
              </span>
              <span className="text-right font-mono-data text-xs">
                {d.proposalsVoted}
              </span>
            </div>
          ))}
        </div>
        <div className="md:hidden space-y-3">
          {pagedDelegates.map((d) => (
            <MobileCard
              key={d.rank}
              rows={[
                {
                  label: "Rank",
                  value: (
                    <span className="font-mono-data font-medium">
                      #{d.rank}
                    </span>
                  ),
                },
                {
                  label: "Address",
                  value: <HashLink hash={d.address} type="address" />,
                },
                {
                  label: "Voting Power",
                  value: (
                    <span className="font-mono-data text-xs">
                      {(d.votingPower / 1_000_000).toFixed(2)}M
                    </span>
                  ),
                },
                {
                  label: "Delegators",
                  value: (
                    <span className="font-mono-data text-xs">
                      {d.delegators}
                    </span>
                  ),
                },
              ]}
            />
          ))}
        </div>
        <div className="mt-3">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={pageSize}
            totalItems={topDelegates.length}
          />
        </div>
      </div>

      {/* Recent Delegation Activity */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-2">
          Recent Delegation Activity
        </h2>
        <div className="hidden md:block rounded-lg bg-card border border-border overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_140px_110px_100px] gap-4 px-5 py-2.5 bg-secondary text-xs text-muted-foreground border-b border-border">
            <span>Delegator</span>
            <span>Delegate</span>
            <span className="text-right">Amount</span>
            <span>Action</span>
            <span className="text-right">Time</span>
          </div>
          {delegationActivity.map((a, i) => (
            <div
              key={i}
              className="row-hover grid grid-cols-[1fr_1fr_140px_110px_100px] gap-4 px-5 py-2.5 border-b border-border last:border-0 items-center"
            >
              <HashLink hash={a.delegator} type="address" />
              <HashLink hash={a.delegate} type="address" />
              <span className="text-right font-mono-data text-xs">
                {a.amount.toLocaleString()} NECTA
              </span>
              <span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium w-fit ${
                    a.action === "delegate"
                      ? "bg-[#22C55E]/10 text-[#22C55E]"
                      : "bg-[#EB5757]/10 text-[#EB5757]"
                  }`}
                >
                  {a.action}
                </span>
              </span>
              <span className="text-right">
                <TimeAgo timestamp={a.timestamp} />
              </span>
            </div>
          ))}
        </div>
        <div className="md:hidden space-y-3">
          {delegationActivity.map((a, i) => (
            <MobileCard
              key={i}
              rows={[
                {
                  label: "Delegator",
                  value: <HashLink hash={a.delegator} type="address" />,
                },
                {
                  label: "Delegate",
                  value: <HashLink hash={a.delegate} type="address" />,
                },
                {
                  label: "Amount",
                  value: (
                    <span className="font-mono-data text-xs">
                      {a.amount.toLocaleString()} NECTA
                    </span>
                  ),
                },
                {
                  label: "Action",
                  value: (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${
                        a.action === "delegate"
                          ? "bg-[#22C55E]/10 text-[#22C55E]"
                          : "bg-[#EB5757]/10 text-[#EB5757]"
                      }`}
                    >
                      {a.action}
                    </span>
                  ),
                },
              ]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
