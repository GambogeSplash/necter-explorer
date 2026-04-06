"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Radio, Wifi, Server, Activity, Database, Zap, AlertTriangle } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { StatCard } from "@/components/stat-card";
import { HashLink } from "@/components/hash-link";
import { TimeAgo } from "@/components/time-ago";
import { Pagination } from "@/components/pagination";
import { MobileCard } from "@/components/mobile-card";
import { PageTitle } from "@/components/page-title";
import { gateways, batchThroughput } from "@/lib/mock-data";

const CHART_TOOLTIP = {
  backgroundColor: "#131315",
  border: "1px solid rgba(255,245,230,0.07)",
  borderRadius: 8,
  fontSize: 12,
  color: "#F9F9F6",
};

export default function IoTPage() {
  const router = useRouter();
  const totalBatches = gateways.reduce((s, g) => s + g.batchCount, 0);
  const totalDevices = gateways.reduce((s, g) => s + g.deviceCount, 0);

  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalItems = gateways.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const pagedGateways = gateways.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="px-2.5 py-2 space-y-4">
      <PageTitle title="IoT Gateways" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">IoT & Gateways</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Gateways" value={gateways.length.toString()} change="+2" trend="up" icon={Server} />
        <StatCard title="Active" value={gateways.length.toString()} icon={Wifi} />
        <StatCard title="Total Batches" value={totalBatches.toLocaleString()} change="+847" trend="up" icon={Activity} />
        <StatCard title="Devices" value={totalDevices.toLocaleString()} change="+124" trend="up" icon={Radio} />
      </div>

      {/* Batch Throughput + Data Volume Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Batch Throughput Chart */}
        <div className="rounded-lg bg-card border border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-medium">Batch Throughput (24h)</h2>
          </div>
          <div className="px-5 py-4">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={batchThroughput}>
                <defs>
                  <linearGradient id="batchGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFC933" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#FFC933" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="timestamp"
                  tick={{ fontSize: 10, fill: "#777470" }}
                  axisLine={false}
                  tickLine={false}
                  interval={3}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#777470" }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <Tooltip contentStyle={CHART_TOOLTIP} formatter={((v: number) => [v, "Batches/hr"]) as never} />
                <Area type="monotone" dataKey="value" stroke="#FFC933" strokeWidth={2} fill="url(#batchGrad)" name="Batches" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Volume Metrics */}
        <div className="grid grid-cols-1 gap-3">
          {[
            { label: "Total Data Processed", value: "1.4 TB", icon: Database, color: "text-[#6E9FFF]" },
            { label: "Avg Batch Size", value: "247 records", icon: Activity, color: "text-[#FFC933]" },
            { label: "Peak Throughput", value: "1,284 batches/hr", icon: Zap, color: "text-[#22C55E]" },
            { label: "Error Rate", value: "0.02%", icon: AlertTriangle, color: "text-[#9985FF]" },
          ].map((metric) => (
            <div key={metric.label} className="rounded-lg bg-card border border-border flex items-center gap-4 px-5 py-3.5">
              <div className="rounded-lg bg-secondary p-2.5 shrink-0">
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">{metric.label}</p>
                <p className="text-lg font-semibold font-mono-data">{metric.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gateways Table */}
      <div className="hidden md:block rounded-lg bg-card border border-border overflow-hidden">
        <div className="grid grid-cols-[70px_1fr_100px_120px_80px_70px_100px] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
          <span>Gateway</span><span>Operator</span><span className="text-right">Stake</span><span>Uptime</span><span className="text-right">Batches</span><span className="text-right">Devices</span><span className="text-right">Last Batch</span>
        </div>
        {pagedGateways.map((gw) => (
          <div key={gw.gatewayId} className="row-hover grid grid-cols-[70px_1fr_100px_120px_80px_70px_100px] gap-3 items-center px-5 py-2.5 border-b border-border last:border-0 text-sm">
            <Link href={`/iot/gateway/${gw.gatewayId}`} className="font-mono-data font-medium text-primary hover:underline">{gw.gatewayId}</Link>
            <HashLink hash={gw.operatorAddress} type="address" />
            <span className="text-right font-mono-data">{parseInt(gw.stake).toLocaleString()}</span>
            <div className="flex items-center gap-2">
              <div className="w-12 h-1 bg-secondary rounded-full overflow-hidden">
                <div className={`h-full rounded-full bar-fill ${gw.uptime > 95 ? "bg-[#22C55E]" : gw.uptime > 80 ? "bg-[#F2994A]" : "bg-[#EB5757]"}`} style={{ width: `${Math.min(gw.uptime, 100)}%` }} />
              </div>
              <span className="font-mono-data text-xs text-muted-foreground">{gw.uptime.toFixed(1)}%</span>
            </div>
            <span className="text-right font-mono-data text-muted-foreground">{gw.batchCount.toLocaleString()}</span>
            <span className="text-right font-mono-data text-muted-foreground">{gw.deviceCount}</span>
            <span className="text-right"><TimeAgo timestamp={gw.lastBatchTimestamp} /></span>
          </div>
        ))}
        <div className="px-5 py-3 border-t border-border">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={pageSize}
            totalItems={totalItems}
          />
        </div>
      </div>
      <div className="md:hidden space-y-3">
        {pagedGateways.map((gw) => (
          <MobileCard
            key={gw.gatewayId}
            onClick={() => router.push(`/iot/gateway/${gw.gatewayId}`)}
            rows={[
              { label: "Gateway ID", value: <span className="font-mono-data text-primary">{gw.gatewayId}</span> },
              { label: "Uptime", value: <span className="font-mono-data">{gw.uptime.toFixed(1)}%</span> },
              { label: "Batches", value: <span className="font-mono-data">{gw.batchCount.toLocaleString()}</span> },
              { label: "Devices", value: <span className="font-mono-data">{gw.deviceCount}</span> },
            ]}
          />
        ))}
        <div className="pt-1">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={pageSize}
            totalItems={totalItems}
          />
        </div>
      </div>
    </div>
  );
}
