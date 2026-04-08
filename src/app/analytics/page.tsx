"use client";

import { useState, useMemo } from "react";
import { BarChart3, Activity, Cpu, Download, Shield } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { showToast } from "@/components/toast";
import { PageTitle } from "@/components/page-title";
import { StatCard } from "@/components/stat-card";
import { MobileCard } from "@/components/mobile-card";
import { DateRangePicker } from "@/components/date-range-picker";
import { tpsHistory, stakingHistory, computeUtilization } from "@/lib/mock-data";

const CHART_TOOLTIP = {
  backgroundColor: "#131315",
  border: "1px solid rgba(255,245,230,0.07)",
  borderRadius: 8,
  fontSize: 12,
  color: "#F9F9F6",
};

const topContracts = [
  { name: "DeviceRegistry", calls: 12_847, gasUsed: "847.2M", callers: 3_412 },
  { name: "JobManager", calls: 8_432, gasUsed: "524.1M", callers: 2_187 },
  { name: "StakeManager", calls: 6_214, gasUsed: "312.8M", callers: 1_843 },
  { name: "GatewayBatcher", calls: 4_891, gasUsed: "287.4M", callers: 892 },
  { name: "ProofVerifier", calls: 3_247, gasUsed: "198.6M", callers: 1_204 },
];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("24h");
  const [compareMode, setCompareMode] = useState(false);

  const tpsCompareData = useMemo(() => {
    return tpsHistory.map((point) => ({
      ...point,
      previousValue: Math.round(point.value * 0.85),
    }));
  }, []);

  const handleExport = () => {
    showToast("Data exported successfully", "success");
  };

  return (
    <div className="max-w-[1480px] mx-auto px-2.5 py-2 space-y-4">
      <PageTitle title="Analytics" />
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Network Analytics</h1>
        <div className="flex items-center gap-3">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`n-btn n-btn--secondary n-btn--sm flex items-center gap-1.5 ${
              compareMode ? "!border-[#FFC933] !text-foreground" : ""
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Compare
          </button>
          <button
            onClick={handleExport}
            className="n-btn n-btn--secondary n-btn--sm flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Avg TPS" value="847" change="+12.4%" trend="up" icon={Activity} />
        <StatCard title="Peak TPS" value="1,284" change="+8.1%" trend="up" icon={BarChart3} />
        <StatCard title="Total Staked" value="45.2M" change="+2.3%" trend="up" icon={Shield} />
        <StatCard title="Compute Utilization" value="78.4%" change="+3.7%" trend="up" icon={Cpu} />
      </div>

      {/* TPS & Staking Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* TPS History */}
        <div className="rounded-lg bg-card border border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-medium">Transactions Per Second (24h)</h2>
          </div>
          <div className="px-5 py-4">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={compareMode ? tpsCompareData : tpsHistory}>
                <defs>
                  <linearGradient id="tpsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFC933" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#FFC933" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="tpsPrevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFC933" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="#FFC933" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,245,230,0.04)" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: "#777470" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: "#777470" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={CHART_TOOLTIP} />
                {compareMode && (
                  <Area
                    type="monotone"
                    dataKey="previousValue"
                    stroke="#FFC933"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    strokeOpacity={0.5}
                    fill="url(#tpsPrevGrad)"
                    fillOpacity={0.5}
                    name="Previous Period"
                  />
                )}
                <Area type="monotone" dataKey="value" stroke="#FFC933" strokeWidth={2} fill="url(#tpsGrad)" name="TPS" />
              </AreaChart>
            </ResponsiveContainer>
            {compareMode && (
              <div className="flex items-center gap-5 mt-3 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-5 h-[2px] bg-[#FFC933]" />
                  Current period (solid)
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-5 h-[2px] bg-[#FFC933]/50" style={{ borderTop: "2px dashed #FFC933", height: 0 }} />
                  Previous period (dashed)
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Staking History */}
        <div className="rounded-lg bg-card border border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-medium">Total Staked NECTA (24h)</h2>
          </div>
          <div className="px-5 py-4">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stakingHistory}>
                <defs>
                  <linearGradient id="stakeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,245,230,0.04)" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: "#777470" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: "#777470" }} axisLine={false} tickLine={false} width={55} tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(1)}M`} />
                <Tooltip contentStyle={CHART_TOOLTIP} formatter={((v: number) => [v.toLocaleString(), "Staked"]) as never} />
                <Area type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={2} fill="url(#stakeGrad)" name="Staked" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Compute Utilization */}
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-medium">Compute Utilization (24h)</h2>
        </div>
        <div className="px-5 py-4">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={computeUtilization}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,245,230,0.04)" />
              <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: "#777470" }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fontSize: 10, fill: "#777470" }} axisLine={false} tickLine={false} width={36} tickFormatter={(v: number) => `${v}%`} />
              <Tooltip contentStyle={CHART_TOOLTIP} formatter={((v: number) => [`${v}%`, "Utilization"]) as never} />
              <Bar dataKey="value" fill="#6E9FFF" radius={[4, 4, 0, 0]} name="Utilization" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Contract Interactions */}
      <div className="hidden md:block rounded-lg bg-card border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-medium">Top Contract Interactions</h2>
        </div>
        <div className="grid grid-cols-[1fr_120px_120px_120px] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
          <span>Contract Name</span>
          <span className="text-right">Call Count</span>
          <span className="text-right">Gas Used</span>
          <span className="text-right">Unique Callers</span>
        </div>
        {topContracts.map((c) => (
          <div key={c.name} className="row-hover grid grid-cols-[1fr_120px_120px_120px] gap-3 items-center px-5 py-2.5 border-b border-border last:border-0 text-sm">
            <span className="font-medium text-foreground">{c.name}</span>
            <span className="text-right font-mono-data text-muted-foreground">{c.calls.toLocaleString()}</span>
            <span className="text-right font-mono-data text-muted-foreground">{c.gasUsed}</span>
            <span className="text-right font-mono-data text-muted-foreground">{c.callers.toLocaleString()}</span>
          </div>
        ))}
      </div>
      <div className="md:hidden space-y-3">
        <h2 className="text-sm font-medium">Top Contract Interactions</h2>
        {topContracts.map((c) => (
          <MobileCard
            key={c.name}
            rows={[
              { label: "Contract", value: <span className="font-medium">{c.name}</span> },
              { label: "Calls", value: <span className="font-mono-data">{c.calls.toLocaleString()}</span> },
              { label: "Gas Used", value: <span className="font-mono-data">{c.gasUsed}</span> },
              { label: "Callers", value: <span className="font-mono-data">{c.callers.toLocaleString()}</span> },
            ]}
          />
        ))}
      </div>
    </div>
  );
}
