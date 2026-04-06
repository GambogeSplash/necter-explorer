"use client";

import Link from "next/link";
import { use, useState } from "react";
import { ArrowLeft, Radio, Layers, Cpu, ShieldCheck, Activity } from "lucide-react";
import { gateways } from "@/lib/mock-data";
import { HashLink } from "@/components/hash-link";
import { StatusBadge } from "@/components/status-badge";
import { TimeAgo } from "@/components/time-ago";
import { MobileCard } from "@/components/mobile-card";

const ANCHOR = new Date("2026-04-05T10:00:00.000Z").getTime();
const hour = 3600_000;
const ts = (offset: number) => new Date(ANCHOR - offset).toISOString();

function getGateway(id: string) {
  return gateways.find((g) => g.gatewayId === id) ?? gateways[0];
}

const recentBatches = Array.from({ length: 5 }, (_, i) => ({
  batchId: `BATCH-${(4000 + i).toString()}`,
  merkleRoot: `0x${(0xf1a2b3 + i * 0x777).toString(16).padStart(8, "0")}c4d5e6f7a8b9c0d1e2f3a4b5`,
  deviceCount: Math.floor((((i * 7919 + 31) % 997) / 997) * 50) + 10,
  timestamp: ts(i * hour * 2 + (((i * 7919 + 31) % 997) / 997) * hour),
  status: i === 2 ? "pending" : "confirmed",
}));

const connectedDevices = Array.from({ length: 5 }, (_, i) => ({
  deviceId: `DEV-${(1000 + i * 3).toString()}`,
  status: i === 3 ? "inactive" : "active",
  lastSeen: ts((((i * 7919 + 31) % 997) / 997) * hour * 4),
}));

const telemetryData = [
  { metric: "CPU Usage", value: "72%", numericPct: 72, status: "normal" as const },
  { metric: "Memory", value: "8.4 GB", numericPct: 65, status: "normal" as const },
  { metric: "Disk I/O", value: "124 MB/s", numericPct: 82, status: "warning" as const },
  { metric: "Network In", value: "45 Mbps", numericPct: 45, status: "normal" as const },
  { metric: "Network Out", value: "32 Mbps", numericPct: 32, status: "normal" as const },
];

export default function GatewayDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const gw = getGateway(id);
  const [verifiedBatches, setVerifiedBatches] = useState<Record<string, boolean>>({});

  const toggleVerify = (batchId: string) => {
    setVerifiedBatches((prev) => ({ ...prev, [batchId]: !prev[batchId] }));
  };

  const details = [
    { label: "Gateway ID", value: <span className="font-mono-data text-primary">{gw.gatewayId}</span> },
    { label: "Operator ID", value: <Link href={`/depin/operator/${gw.operatorId}`} className="font-mono-data text-primary hover:underline">{gw.operatorId}</Link> },
    { label: "Operator Address", value: <HashLink hash={gw.operatorAddress} type="address" /> },
    { label: "Stake", value: <span className="font-mono-data">{Number(gw.stake).toLocaleString()} NECTA</span> },
    { label: "Uptime", value: <span className={`font-mono-data ${gw.uptime > 95 ? "text-[#22C55E]" : "text-[#F2994A]"}`}>{gw.uptime.toFixed(1)}%</span> },
    { label: "Batch Count", value: <span className="font-mono-data">{gw.batchCount.toLocaleString()}</span> },
    { label: "Device Count", value: <span className="font-mono-data">{gw.deviceCount}</span> },
    { label: "Last Batch", value: <TimeAgo timestamp={gw.lastBatchTimestamp} /> },
  ];

  return (
    <div className="px-2.5 py-2 space-y-4">
      <Link href="/iot" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 w-fit">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to IoT
      </Link>

      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-secondary p-2">
          <Radio className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-lg font-semibold tracking-tight">Gateway {gw.gatewayId}</h1>
      </div>

      {/* Gateway Info */}
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-medium">Gateway Information</h2>
        </div>
        {details.map((row) => (
          <div key={row.label} className="flex items-center justify-between px-5 py-2.5 border-b border-border last:border-0">
            <span className="text-sm text-muted-foreground">{row.label}</span>
            <div className="text-right">{row.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Batches */}
        <div className="rounded-lg bg-card border border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium">Recent Batches</h2>
          </div>
          {/* Mobile */}
          <div className="md:hidden space-y-3 p-4">
            {recentBatches.map((b) => (
              <MobileCard
                key={b.batchId}
                rows={[
                  { label: "Batch ID", value: <span className="font-mono-data text-xs text-primary">{b.batchId}</span> },
                  { label: "Devices", value: <span className="font-mono-data text-xs">{b.deviceCount}</span> },
                  { label: "Status", value: <StatusBadge status={b.status} /> },
                  { label: "Time", value: <TimeAgo timestamp={b.timestamp} /> },
                ]}
              />
            ))}
          </div>
          {/* Desktop */}
          <div className="hidden md:block">
            <div className="grid grid-cols-[90px_1fr_70px_90px_90px] gap-3 px-5 py-2 bg-secondary text-xs text-muted-foreground border-b border-border">
              <span>Batch ID</span><span>Merkle Root</span><span>Devices</span><span>Status</span><span>Time</span>
            </div>
            {recentBatches.map((b) => (
              <div key={b.batchId} className="row-hover grid grid-cols-[90px_1fr_70px_90px_90px] gap-3 px-5 py-2.5 border-b border-border last:border-0 items-center">
                <span className="font-mono-data text-xs text-primary">{b.batchId}</span>
                <span className="font-mono-data text-xs text-muted-foreground truncate">{b.merkleRoot}</span>
                <span className="font-mono-data text-xs">{b.deviceCount}</span>
                <StatusBadge status={b.status} />
                <TimeAgo timestamp={b.timestamp} />
              </div>
            ))}
          </div>
        </div>

        {/* Connected Devices */}
        <div className="rounded-lg bg-card border border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center gap-2">
            <Cpu className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium">Connected Devices</h2>
          </div>
          {/* Mobile */}
          <div className="md:hidden space-y-3 p-4">
            {connectedDevices.map((d) => (
              <MobileCard
                key={d.deviceId}
                rows={[
                  { label: "Device", value: <Link href={`/depin/device/${d.deviceId}`} className="font-mono-data text-sm text-primary hover:underline">{d.deviceId}</Link> },
                  { label: "Status", value: <StatusBadge status={d.status} /> },
                  { label: "Last Seen", value: <TimeAgo timestamp={d.lastSeen} /> },
                ]}
              />
            ))}
          </div>
          {/* Desktop */}
          <div className="hidden md:block">
            <div className="grid grid-cols-[1fr_90px_120px] gap-4 px-5 py-2 bg-secondary text-xs text-muted-foreground border-b border-border">
              <span>Device ID</span><span>Status</span><span>Last Seen</span>
            </div>
            {connectedDevices.map((d) => (
              <div key={d.deviceId} className="row-hover grid grid-cols-[1fr_90px_120px] gap-4 px-5 py-2.5 border-b border-border last:border-0 items-center">
                <Link href={`/depin/device/${d.deviceId}`} className="font-mono-data text-sm text-primary hover:underline">{d.deviceId}</Link>
                <StatusBadge status={d.status} />
                <TimeAgo timestamp={d.lastSeen} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Batch Verification */}
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-medium">Batch Verification</h2>
        </div>
        {/* Mobile */}
        <div className="md:hidden space-y-3 p-4">
          {recentBatches.map((b) => {
            const verified = verifiedBatches[b.batchId];
            return (
              <MobileCard
                key={b.batchId}
                rows={[
                  { label: "Batch ID", value: <span className="font-mono-data text-xs text-primary">{b.batchId}</span> },
                  { label: "Leaves", value: <span className="font-mono-data text-xs">{b.deviceCount}</span> },
                  { label: "Action", value: <button onClick={() => toggleVerify(b.batchId)} className={`h-7 px-3 rounded-md text-[11px] font-medium transition-colors ${verified ? "bg-[#22C55E]/10 text-[#22C55E] cursor-default" : "bg-[#FFC933]/10 text-[#FFC933] hover:bg-[#FFC933]/20"}`}>{verified ? "Verified \u2713" : "Verify Proof"}</button> },
                ]}
              />
            );
          })}
        </div>
        {/* Desktop */}
        <div className="hidden md:block">
          <div className="grid grid-cols-[90px_1fr_80px_90px_120px] gap-3 px-5 py-2 bg-secondary text-xs text-muted-foreground border-b border-border">
            <span>Batch ID</span><span>Merkle Root</span><span>Depth</span><span>Leaves</span><span>Action</span>
          </div>
          {recentBatches.map((b) => {
            const verified = verifiedBatches[b.batchId];
            return (
              <div key={b.batchId} className="row-hover grid grid-cols-[90px_1fr_80px_90px_120px] gap-3 px-5 py-2.5 border-b border-border last:border-0 items-center">
                <span className="font-mono-data text-xs text-primary">{b.batchId}</span>
                <span className="font-mono-data text-xs text-muted-foreground truncate">{b.merkleRoot}</span>
                <span className="font-mono-data text-xs">12 levels</span>
                <span className="font-mono-data text-xs">{b.deviceCount}</span>
                <button
                  onClick={() => toggleVerify(b.batchId)}
                  className={`h-7 px-3 rounded-md text-[11px] font-medium transition-colors ${
                    verified
                      ? "bg-[#22C55E]/10 text-[#22C55E] cursor-default"
                      : "bg-[#FFC933]/10 text-[#FFC933] hover:bg-[#FFC933]/20"
                  }`}
                >
                  {verified ? "Verified \u2713" : "Verify Proof"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Device Telemetry Summary */}
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-medium">Device Telemetry Summary</h2>
        </div>
        {/* Mobile */}
        <div className="md:hidden space-y-3 p-4">
          {telemetryData.map((t) => (
            <MobileCard
              key={t.metric}
              rows={[
                { label: "Metric", value: <span className="text-sm">{t.metric}</span> },
                { label: "Current", value: <span className="font-mono-data text-sm">{t.value}</span> },
                { label: "Usage", value: <span className="font-mono-data text-xs">{t.numericPct}%</span> },
                { label: "Status", value: <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium ${t.status === "warning" ? "bg-[#F2994A]/10 text-[#F2994A]" : "bg-[#22C55E]/10 text-[#22C55E]"}`}>{t.status}</span> },
              ]}
            />
          ))}
        </div>
        {/* Desktop */}
        <div className="hidden md:block">
          <div className="grid grid-cols-[140px_100px_1fr_80px] gap-3 px-5 py-2 bg-secondary text-xs text-muted-foreground border-b border-border">
            <span>Metric</span><span>Current</span><span>Usage</span><span>Status</span>
          </div>
          {telemetryData.map((t) => (
            <div key={t.metric} className="row-hover grid grid-cols-[140px_100px_1fr_80px] gap-3 px-5 py-2.5 border-b border-border last:border-0 items-center">
              <span className="text-sm">{t.metric}</span>
              <span className="font-mono-data text-sm">{t.value}</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden max-w-[200px]">
                  <div
                    className={`h-full rounded-full ${t.status === "warning" ? "bg-[#F2994A]" : "bg-[#22C55E]"}`}
                    style={{ width: `${t.numericPct}%` }}
                  />
                </div>
                <span className="font-mono-data text-xs text-muted-foreground">{t.numericPct}%</span>
              </div>
              <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium ${
                t.status === "warning" ? "bg-[#F2994A]/10 text-[#F2994A]" : "bg-[#22C55E]/10 text-[#22C55E]"
              }`}>
                {t.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
