"use client";

import {
  Shield,
  Users,
  Activity,
  AlertTriangle,
  Trophy,
  Calculator,
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/stat-card";
import { HashLink } from "@/components/hash-link";
import { StatusBadge } from "@/components/status-badge";
import { TimeAgo } from "@/components/time-ago";
import { Pagination } from "@/components/pagination";
import { MobileCard } from "@/components/mobile-card";
import { DateRangePicker } from "@/components/date-range-picker";
import { PageTitle } from "@/components/page-title";
import {
  operators,
  stakingHistory,
  apyHistory,
  stakeDistribution,
  unstakingQueue,
} from "@/lib/mock-data";
import { useState } from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const medals = ["text-[#FFC933]", "text-[#A8A89C]", "text-[#F2994A]"];

const tooltipStyle = {
  backgroundColor: "#131315",
  border: "1px solid rgba(255,245,230,0.07)",
  borderRadius: 8,
  fontSize: 12,
  color: "#F9F9F6",
};

const PAGE_SIZE = 25;

const ANCHOR = new Date("2026-04-05T10:00:00.000Z").getTime();
const hour = 3600_000;
const day = hour * 24;

const recentDelegations = Array.from({ length: 6 }, (_, i) => {
  const seed = ((i * 7919 + 31) % 997) / 997;
  const statuses = ["active", "pending", "undelegating"] as const;
  return {
    delegator: `0x${((0xa1b2c3d4 + i * 0x1111111) >>> 0).toString(16).padStart(8, "0")}e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0`,
    operator: `0x${((0xf9e8d7c6 - i * 0x2222222) >>> 0).toString(16).padStart(8, "0")}1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d`,
    amount: Math.floor(seed * 50000) + 5000,
    date: new Date(ANCHOR - i * day * 2 - seed * day).toISOString(),
    status: statuses[i % 3],
  };
});

const rewardClaims = Array.from({ length: 5 }, (_, i) => {
  const seed = ((i * 7919 + 31) % 997) / 997;
  return {
    claimer: `0x${((0xc3d4e5f6 + i * 0x3333333) >>> 0).toString(16).padStart(8, "0")}7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d`,
    amount: Math.floor(seed * 2000) + 200,
    epoch: 1420 + i,
    date: new Date(ANCHOR - i * day * 3 - seed * day * 2).toISOString(),
    txHash: `0x${((0xabcdef01 + i * 0x4444444) >>> 0).toString(16).padStart(8, "0")}23456789abcdef0123456789abcdef01234567`,
  };
});

export default function StakingPage() {
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [apyRange, setApyRange] = useState("30d");
  const [stakeAmount, setStakeAmount] = useState<number>(10000);

  const totalStaked = operators.reduce((s, o) => s + parseInt(o.stake), 0);
  const activeValidators = operators.filter(
    (o) => o.status === "active",
  ).length;
  const avgUptime =
    operators.reduce((s, o) => s + o.uptimePercent, 0) / operators.length;
  const totalSlashes = operators.reduce((s, o) => s + o.slashes, 0);
  const sorted = [...operators].sort(
    (a, b) => parseInt(b.stake) - parseInt(a.stake),
  );

  const leaderboardTotalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginatedLeaderboard = sorted.slice(
    (leaderboardPage - 1) * PAGE_SIZE,
    leaderboardPage * PAGE_SIZE,
  );
  const leaderboardOffset = (leaderboardPage - 1) * PAGE_SIZE;

  // Reward calculations at 10.2% APY
  const APY = 0.102;
  const dailyReward = stakeAmount * APY / 365;
  const weeklyReward = dailyReward * 7;
  const monthlyReward = dailyReward * 30;
  const yearlyReward = stakeAmount * APY;

  return (
    <div className="px-2.5 py-2 space-y-4">
      <PageTitle title="Staking" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Hardware Staking
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Staking overview, validators, and delegation
          </p>
        </div>
        
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total Staked"
          value={`${(totalStaked / 1000).toFixed(0)}K`}
          change="+4.2%"
          trend="up"
          icon={Shield}
        />
        <StatCard
          title="Active Validators"
          value={activeValidators.toString()}
          change="+2"
          trend="up"
          icon={Users}
        />
        <StatCard
          title="Avg Uptime"
          value={`${avgUptime.toFixed(1)}%`}
          icon={Activity}
        />
        <StatCard
          title="Slashes"
          value={totalSlashes.toString()}
          icon={AlertTriangle}
        />
      </div>

      {/* Charts Row: Staking History + APY Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg bg-card border border-border p-5">
          <p className="text-xs text-muted-foreground mb-4">
            Staking History (NECTA)
          </p>
          <div className="chart-reveal">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={stakingHistory}>
              <defs>
                <linearGradient
                  id="stakingGrad2"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,245,230,0.04)" />
              <XAxis
                dataKey="timestamp"
                tick={{ fontSize: 10, fill: "#777470" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#777470" }}
                axisLine={false}
                tickLine={false}
                width={45}
                tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: "#777470" }}
                formatter={((v: number) => [
                  `${(v / 1_000_000).toFixed(2)}M NECTA`,
                  "Staked",
                ]) as never}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#22C55E"
                fill="url(#stakingGrad2)"
                strokeWidth={1.5}
              />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg bg-card border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-muted-foreground">APY Trend (%)</p>
            <DateRangePicker value={apyRange} onChange={setApyRange} />
          </div>
          <div className="chart-reveal">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={apyHistory}>
              <defs>
                <linearGradient id="apyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFC933" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#FFC933" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,245,230,0.04)" />
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
                width={35}
                tickFormatter={(v) => `${v}%`}
                domain={["dataMin - 0.5", "dataMax + 0.5"]}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: "#777470" }}
                formatter={((v: number) => [`${v.toFixed(2)}%`, "APY"]) as never}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#FFC933"
                fill="url(#apyGrad)"
                strokeWidth={1.5}
              />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Stake Distribution Pie */}
      <div className="rounded-lg bg-card border border-border p-5">
        <p className="text-xs text-muted-foreground mb-4">
          Stake Distribution
        </p>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="chart-reveal">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={stakeDistribution}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                paddingAngle={2}
              >
                {stakeDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={((v: number) => [
                  `${(v / 1_000_000).toFixed(2)}M NECTA`,
                  "Staked",
                ]) as never}
              />
            </PieChart>
          </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3">
            {stakeDistribution.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
              >
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                {s.label} ({(s.value / 1_000_000).toFixed(1)}M)
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reward Calculator */}
      <div className="rounded-lg bg-card border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-medium">Reward Calculator</h2>
          <span className="text-[11px] text-muted-foreground ml-auto">
            Current APY: 10.2%
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
          <div className="lg:col-span-1">
            <label className="text-xs text-muted-foreground block mb-1.5">
              Amount to Stake (NECTA)
            </label>
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) =>
                setStakeAmount(Math.max(0, Number(e.target.value)))
              }
              className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm font-mono-data text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              min={0}
            />
          </div>
          <div className="rounded-md bg-secondary p-3 text-center">
            <p className="text-[11px] text-muted-foreground">Daily</p>
            <p className="text-sm font-semibold font-mono-data text-[#FFC933]">
              {dailyReward.toFixed(2)}
            </p>
          </div>
          <div className="rounded-md bg-secondary p-3 text-center">
            <p className="text-[11px] text-muted-foreground">Weekly</p>
            <p className="text-sm font-semibold font-mono-data text-[#FFC933]">
              {weeklyReward.toFixed(2)}
            </p>
          </div>
          <div className="rounded-md bg-secondary p-3 text-center">
            <p className="text-[11px] text-muted-foreground">Monthly</p>
            <p className="text-sm font-semibold font-mono-data text-[#FFC933]">
              {monthlyReward.toFixed(2)}
            </p>
          </div>
          <div className="rounded-md bg-secondary p-3 text-center">
            <p className="text-[11px] text-muted-foreground">Yearly</p>
            <p className="text-sm font-semibold font-mono-data text-[#22C55E]">
              {yearlyReward.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Unstaking Queue */}
      <div className="hidden md:block rounded-lg bg-card border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-medium">Unstaking Queue</h2>
        </div>
        <div className="grid grid-cols-[1fr_100px_120px_80px] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
          <span>Address</span>
          <span className="text-right">Amount</span>
          <span>Unlock Time</span>
          <span>Status</span>
        </div>
        {unstakingQueue.map((entry, i) => (
          <div
            key={i}
            className="row-hover grid grid-cols-[1fr_100px_120px_80px] gap-3 items-center px-5 py-2.5 border-b border-border last:border-0 text-sm"
          >
            <HashLink hash={entry.address} type="address" />
            <span className="text-right font-mono-data">
              {parseInt(entry.amount).toLocaleString()}
            </span>
            <TimeAgo timestamp={entry.unlockTime} />
            <StatusBadge status={entry.status} />
          </div>
        ))}
      </div>
      <div className="md:hidden space-y-3">
        <h2 className="text-sm font-medium">Unstaking Queue</h2>
        {unstakingQueue.map((entry, i) => (
          <MobileCard
            key={i}
            rows={[
              { label: "Address", value: <span className="font-mono-data text-xs">{entry.address.slice(0, 10)}...{entry.address.slice(-6)}</span> },
              { label: "Amount", value: <span className="font-mono-data">{parseInt(entry.amount).toLocaleString()}</span> },
              { label: "Unlock", value: <TimeAgo timestamp={entry.unlockTime} /> },
              { label: "Status", value: <StatusBadge status={entry.status} /> },
            ]}
          />
        ))}
      </div>

      {/* Recent Delegations */}
      <div className="hidden md:block rounded-lg bg-card border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-medium">Recent Delegations</h2>
        </div>
        <div className="grid grid-cols-[1fr_1fr_100px_120px_100px] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
          <span>Delegator</span>
          <span>Operator</span>
          <span className="text-right">Amount</span>
          <span>Date</span>
          <span>Status</span>
        </div>
        {recentDelegations.map((d, i) => (
          <div
            key={i}
            className="row-hover grid grid-cols-[1fr_1fr_100px_120px_100px] gap-3 items-center px-5 py-2.5 border-b border-border last:border-0 text-sm"
          >
            <HashLink hash={d.delegator} type="address" />
            <HashLink hash={d.operator} type="address" />
            <span className="text-right font-mono-data">
              {d.amount.toLocaleString()}
            </span>
            <TimeAgo timestamp={d.date} />
            <StatusBadge status={d.status} />
          </div>
        ))}
      </div>
      <div className="md:hidden space-y-3">
        <h2 className="text-sm font-medium">Recent Delegations</h2>
        {recentDelegations.map((d, i) => (
          <MobileCard
            key={i}
            rows={[
              { label: "Delegator", value: <span className="font-mono-data text-xs">{d.delegator.slice(0, 10)}...{d.delegator.slice(-6)}</span> },
              { label: "Operator", value: <span className="font-mono-data text-xs">{d.operator.slice(0, 10)}...{d.operator.slice(-6)}</span> },
              { label: "Amount", value: <span className="font-mono-data">{d.amount.toLocaleString()}</span> },
              { label: "Date", value: <TimeAgo timestamp={d.date} /> },
              { label: "Status", value: <StatusBadge status={d.status} /> },
            ]}
          />
        ))}
      </div>

      {/* Recent Reward Claims */}
      <div className="hidden md:block rounded-lg bg-card border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-medium">Recent Reward Claims</h2>
        </div>
        <div className="grid grid-cols-[1fr_100px_70px_120px_1fr] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
          <span>Claimer</span>
          <span className="text-right">Amount</span>
          <span>Epoch</span>
          <span>Date</span>
          <span>Tx Hash</span>
        </div>
        {rewardClaims.map((r, i) => (
          <div
            key={i}
            className="row-hover grid grid-cols-[1fr_100px_70px_120px_1fr] gap-3 items-center px-5 py-2.5 border-b border-border last:border-0 text-sm"
          >
            <HashLink hash={r.claimer} type="address" />
            <span className="text-right font-mono-data">
              {r.amount.toLocaleString()} NECTA
            </span>
            <span className="font-mono-data text-muted-foreground">
              {r.epoch}
            </span>
            <TimeAgo timestamp={r.date} />
            <HashLink hash={r.txHash} type="tx" />
          </div>
        ))}
      </div>
      <div className="md:hidden space-y-3">
        <h2 className="text-sm font-medium">Recent Reward Claims</h2>
        {rewardClaims.map((r, i) => (
          <MobileCard
            key={i}
            rows={[
              { label: "Claimer", value: <span className="font-mono-data text-xs">{r.claimer.slice(0, 10)}...{r.claimer.slice(-6)}</span> },
              { label: "Amount", value: <span className="font-mono-data">{r.amount.toLocaleString()} NECTA</span> },
              { label: "Epoch", value: <span className="font-mono-data">{r.epoch}</span> },
              { label: "Date", value: <TimeAgo timestamp={r.date} /> },
              { label: "Tx Hash", value: <span className="font-mono-data text-xs">{r.txHash.slice(0, 10)}...{r.txHash.slice(-6)}</span> },
            ]}
          />
        ))}
      </div>

      {/* Operator Leaderboard */}
      <div className="space-y-4">
        <div className="hidden md:block rounded-lg bg-card border border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-medium">Operator Leaderboard</h2>
          </div>
          <div className="grid grid-cols-[40px_70px_1fr_100px_70px_120px_80px_80px] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
            <span>#</span>
            <span>ID</span>
            <span>Address</span>
            <span className="text-right">Stake</span>
            <span className="text-right">Deleg.</span>
            <span>Uptime</span>
            <span>Rep.</span>
            <span>Status</span>
          </div>
          {paginatedLeaderboard.map((op, i) => {
            const rank = leaderboardOffset + i;
            return (
              <div
                key={op.operatorId}
                className="row-hover grid grid-cols-[40px_70px_1fr_100px_70px_120px_80px_80px] gap-3 items-center px-5 py-2.5 border-b border-border last:border-0 text-sm"
              >
                <span
                  className={`font-mono-data font-bold ${rank < 3 ? medals[rank] : "text-muted-foreground"}`}
                >
                  {rank + 1}
                </span>
                <span className="font-mono-data text-xs text-muted-foreground">
                  {op.operatorId}
                </span>
                <HashLink hash={op.address} type="address" />
                <span className="text-right font-mono-data">
                  {parseInt(op.stake).toLocaleString()}
                </span>
                <span className="text-right font-mono-data text-muted-foreground">
                  {op.delegations}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono-data text-xs ${op.uptimePercent > 95 ? "text-[#22C55E]" : op.uptimePercent > 80 ? "text-[#F2994A]" : "text-[#EB5757]"}`}
                  >
                    {op.uptimePercent.toFixed(1)}%
                  </span>
                </div>
                <span
                  className={`font-mono-data font-medium ${op.reputation > 80 ? "text-[#22C55E]" : op.reputation > 50 ? "text-[#F2994A]" : "text-[#EB5757]"}`}
                >
                  {op.reputation}/100
                </span>
                <StatusBadge status={op.status} />
              </div>
            );
          })}
        </div>
        <div className="md:hidden">
          <div className="px-1 py-2 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-medium">Operator Leaderboard</h2>
          </div>
          <div className="space-y-3">
            {paginatedLeaderboard.map((op, i) => {
              const rank = leaderboardOffset + i;
              return (
                <MobileCard
                  key={op.operatorId}
                  rows={[
                    { label: "Rank / ID", value: <span className="font-mono-data"><span className={`font-bold ${rank < 3 ? medals[rank] : "text-muted-foreground"}`}>#{rank + 1}</span> {op.operatorId}</span> },
                    { label: "Stake", value: <span className="font-mono-data">{parseInt(op.stake).toLocaleString()}</span> },
                    { label: "Uptime", value: <span className={`font-mono-data ${op.uptimePercent > 95 ? "text-[#22C55E]" : op.uptimePercent > 80 ? "text-[#F2994A]" : "text-[#EB5757]"}`}>{op.uptimePercent.toFixed(1)}%</span> },
                    { label: "Reputation", value: <span className={`font-mono-data font-medium ${op.reputation > 80 ? "text-[#22C55E]" : op.reputation > 50 ? "text-[#F2994A]" : "text-[#EB5757]"}`}>{op.reputation}/100</span> },
                  ]}
                />
              );
            })}
          </div>
        </div>
        <Pagination
          currentPage={leaderboardPage}
          totalPages={leaderboardTotalPages}
          onPageChange={setLeaderboardPage}
          pageSize={PAGE_SIZE}
          totalItems={sorted.length}
        />
      </div>

      {/* Compare Operators CTA */}
      <div className="rounded-lg bg-card border border-border p-5 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium">Compare Operators</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Compare performance, reputation, and rewards side by side</p>
        </div>
        <Link href="/compare" className="n-btn n-btn--primary n-btn--sm inline-flex items-center">
          Compare
        </Link>
      </div>
    </div>
  );
}
