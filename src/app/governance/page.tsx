"use client";

import { Vote, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { HashLink } from "@/components/hash-link";
import { StatusBadge } from "@/components/status-badge";
import { TimeAgo } from "@/components/time-ago";
import { DateRangePicker } from "@/components/date-range-picker";
import { PageTitle } from "@/components/page-title";
import { proposals, treasury, treasuryFlowHistory } from "@/lib/mock-data";
import { useState } from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const tooltipStyle = {
  backgroundColor: "#131315",
  border: "1px solid rgba(255,245,230,0.07)",
  borderRadius: 8,
  fontSize: 12,
  color: "#F9F9F6",
};

export default function GovernancePage() {
  const [flowRange, setFlowRange] = useState("30d");

  return (
    <div className="px-2.5 py-2 space-y-4">
      <PageTitle title="Governance" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Governance & Treasury
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            DAO proposals, voting, and treasury
          </p>
        </div>
        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Proposals */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-medium text-muted-foreground">
              Proposals
            </h2>
            <Link
              href="/governance/delegates"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline underline-offset-2 transition-colors"
            >
              View Delegates
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {proposals.map((p) => {
            const total = p.votesFor + p.votesAgainst;
            const forPct = total > 0 ? (p.votesFor / total) * 100 : 0;
            return (
              <Link
                key={p.proposalId}
                href={`/governance/${p.proposalId}`}
                className="block rounded-lg bg-card border border-border p-4 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono-data text-[11px] text-muted-foreground">
                    {p.proposalId}
                  </span>
                  <StatusBadge status={p.status} />
                </div>
                <h3 className="text-sm font-medium">{p.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {p.description}
                </p>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                  <span className="font-mono-data">{p.proposer.slice(0, 10)}...{p.proposer.slice(-6)}</span>
                  <span>&middot;</span>
                  <TimeAgo timestamp={p.createdAt} />
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-[#22C55E]">
                      For {(p.votesFor / 1_000_000).toFixed(1)}M (
                      {forPct.toFixed(0)}%)
                    </span>
                    <span className="text-[#EB5757]">
                      Against {(p.votesAgainst / 1_000_000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#EB5757]/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#22C55E] rounded-full vote-fill"
                      style={{ width: `${forPct}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Treasury */}
        <div className="space-y-3">
          <div className="rounded-lg bg-card border border-border p-5">
            <p className="text-xs text-muted-foreground">Treasury Balance</p>
            <p className="text-2xl font-semibold tracking-tight mt-1 font-mono-data">
              {treasury.balance}
            </p>
            <p className="text-[11px] text-muted-foreground">NECTA</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-card border border-border p-4">
              <div className="flex items-center gap-1 text-[#22C55E]">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span className="text-[11px]">Inflows</span>
              </div>
              <p className="text-base font-semibold font-mono-data mt-1">
                {treasury.inflows}
              </p>
            </div>
            <div className="rounded-lg bg-card border border-border p-4">
              <div className="flex items-center gap-1 text-[#EB5757]">
                <ArrowDownRight className="h-3.5 w-3.5" />
                <span className="text-[11px]">Outflows</span>
              </div>
              <p className="text-base font-semibold font-mono-data mt-1">
                {treasury.outflows}
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-card border border-border overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border">
              <h3 className="text-xs font-medium">Recent</h3>
            </div>
            {treasury.recentTransactions.map((tx, i) => (
              <div
                key={i}
                className="row-hover flex items-center justify-between px-4 py-2 border-b border-border last:border-0"
              >
                <span className="text-xs">{tx.type}</span>
                <span className="font-mono-data text-xs">{tx.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Proposal CTA */}
      <div className="rounded-lg bg-card border border-border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium">Create Proposal</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Submit a new governance proposal for community vote</p>
        </div>
        <button className="n-btn n-btn--primary n-btn--md shrink-0">
          Draft Proposal
        </button>
      </div>

      {/* Treasury Flow Chart */}
      <div className="rounded-lg bg-card border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-muted-foreground">
            Treasury Flow (30 Days)
          </p>
          <DateRangePicker value={flowRange} onChange={setFlowRange} />
        </div>
        <div className="chart-reveal">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={treasuryFlowHistory}>
            <defs>
              <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EB5757" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#EB5757" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="timestamp"
              tick={{ fontSize: 10, fill: "#777470" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => {
                const d = new Date(v);
                return `${d.getMonth() + 1}/${d.getDate()}`;
              }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#777470" }}
              axisLine={false}
              tickLine={false}
              width={45}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: "#777470" }}
              formatter={(v: number, name: string) => [
                `${v.toLocaleString()} NECTA`,
                name === "inflow" ? "Inflow" : "Outflow",
              ]}
            />
            <Area
              type="monotone"
              dataKey="inflow"
              stroke="#22C55E"
              fill="url(#inflowGrad)"
              strokeWidth={1.5}
            />
            <Area
              type="monotone"
              dataKey="outflow"
              stroke="#EB5757"
              fill="url(#outflowGrad)"
              strokeWidth={1.5}
            />
          </AreaChart>
        </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
