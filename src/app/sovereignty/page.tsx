"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Lock, FileText, Eye, ShieldCheck } from "lucide-react";
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
import { StatusBadge } from "@/components/status-badge";
import { TimeAgo } from "@/components/time-ago";
import { Pagination } from "@/components/pagination";
import { PageTitle } from "@/components/page-title";
import { MobileCard } from "@/components/mobile-card";

// ─── Mock Data ──────────────────────────────────────────────────────────────

const ANCHOR = new Date("2026-04-05T10:00:00.000Z").getTime();
const hour = 3600_000;
const day = 86400_000;
const ts = (offset: number) => new Date(ANCHOR - offset).toISOString();

const policies = Array.from({ length: 12 }, (_, i) => ({
  policyId: `POL-${(3000 + i).toString()}`,
  owner: `0x${(0x4a5b + i * 0x17).toString(16).padStart(4, "0")}C3d4E5f6A7b8C9d0E1f2A3b4C5d6E7f8`,
  rulesHash: `ipfs://Qm${(0xccdd + i).toString(16).padStart(6, "0")}...${(0xeeff + i).toString(16).slice(0, 4)}`,
  type: (["data-retention", "access-control", "privacy", "geo-restriction"] as const)[i % 4],
  status: i === 2 ? "expired" : i === 10 ? "draft" : "active",
  createdAt: ts(i * day * 1.5 + (((i * 7919 + 31) % 997) / 997) * hour * 6),
}));

const accessLogs = Array.from({ length: 12 }, (_, i) => ({
  eventId: `EVT-${(7000 + i).toString()}`,
  policyId: `POL-${(3000 + (i % 6)).toString()}`,
  action: i % 3 === 0 ? "revoke" : "grant",
  grantee: `0x${(0x8c9d + i * 0x21).toString(16).padStart(4, "0")}F6a7B8c9D0e1F2a3B4c5D6e7F8a9B0c1`,
  resource: ["user-data-v2", "telemetry-stream", "model-weights", "device-logs", "tx-history", "auth-tokens"][i % 6],
  timestamp: ts(i * hour * 3 + (((i * 7919 + 31) % 997) / 997) * hour),
}));

const complianceProofs = Array.from({ length: 12 }, (_, i) => ({
  proofId: `ZKP-${(9000 + i).toString()}`,
  policyId: `POL-${(3000 + (i % 5)).toString()}`,
  type: (["zk-snark", "zk-stark", "merkle"] as const)[i % 3],
  verifier: `0x${(0x1e2f + i * 0x14).toString(16).padStart(4, "0")}D4e5F6a7B8c9D0e1F2a3B4c5D6e7F8a9`,
  status: i === 4 ? "pending" : i === 9 ? "failed" : "verified",
  verifiedAt: ts(i * hour * 4 + (((i * 7919 + 31) % 997) / 997) * hour * 2),
}));

type TabId = "policies" | "access" | "proofs";

const policyTypeColors: Record<string, string> = {
  "data-retention": "bg-[#6E9FFF]/10 text-[#6E9FFF]",
  "access-control": "bg-[#FFC933]/10 text-[#FFC933]",
  privacy: "bg-[#6E9FFF]/10 text-[#6E9FFF]",
  "geo-restriction": "bg-[#EB5757]/10 text-[#EB5757]",
};

const proofTypeColors: Record<string, string> = {
  "zk-snark": "bg-[#6E9FFF]/10 text-[#6E9FFF]",
  "zk-stark": "bg-[#6E9FFF]/10 text-[#6E9FFF]",
  merkle: "bg-[#FFC933]/10 text-[#FFC933]",
};

// Compliance trend mock data (30 days)
const complianceTrend = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  value: parseFloat((97 + Math.sin(i * 0.3) * 1.2 + (i / 29) * 1.5).toFixed(1)),
}));

export default function SovereigntyPage() {
  const [tab, setTab] = useState<TabId>("policies");

  // Pagination state for each tab
  const [policiesPage, setPoliciesPage] = useState(1);
  const [accessPage, setAccessPage] = useState(1);
  const [proofsPage, setProofsPage] = useState(1);
  const pageSize = 5;

  const policiesTotal = policies.length;
  const policiesTotalPages = Math.ceil(policiesTotal / pageSize);
  const pagedPolicies = policies.slice((policiesPage - 1) * pageSize, policiesPage * pageSize);

  const accessTotal = accessLogs.length;
  const accessTotalPages = Math.ceil(accessTotal / pageSize);
  const pagedAccess = accessLogs.slice((accessPage - 1) * pageSize, accessPage * pageSize);

  const proofsTotal = complianceProofs.length;
  const proofsTotalPages = Math.ceil(proofsTotal / pageSize);
  const pagedProofs = complianceProofs.slice((proofsPage - 1) * pageSize, proofsPage * pageSize);

  const CHART_TOOLTIP = {
    backgroundColor: "#131315",
    border: "1px solid rgba(255,245,230,0.07)",
    borderRadius: 8,
    fontSize: 12,
    color: "#F9F9F6",
  };

  return (
    <div className="max-w-[1480px] mx-auto px-2.5 py-2 space-y-4">
      <PageTitle title="Data Sovereignty" />
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Data Sovereignty</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Total Policies" value="1,247" change="+4.2%" trend="up" icon={FileText} />
        <StatCard title="Active Policies" value="1,089" change="+2.1%" trend="up" icon={Lock} />
        <StatCard title="Access Events (24h)" value="3,847" change="+18.3%" trend="up" icon={Eye} />
        <StatCard title="Proofs Verified" value="12,847" change="+9.7%" trend="up" icon={ShieldCheck} />
      </div>

      {/* Compliance Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Compliance Metric Cards */}
        <div className="grid grid-cols-1 gap-3">
          <div className="rounded-lg bg-card border border-border flex items-center gap-4 px-5 py-4">
            <div className="rounded-lg bg-[#22C55E]/10 p-3 shrink-0">
              <ShieldCheck className="h-5 w-5 text-[#22C55E]" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">Policies Compliant</p>
              <p className="text-2xl font-semibold font-mono-data text-[#22C55E]">1,089</p>
            </div>
          </div>
          <div className="rounded-lg bg-card border border-border flex items-center gap-4 px-5 py-4">
            <div className="rounded-lg bg-[#EB5757]/10 p-3 shrink-0">
              <FileText className="h-5 w-5 text-[#EB5757]" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">Non-Compliant</p>
              <p className="text-2xl font-semibold font-mono-data text-[#EB5757]">12</p>
            </div>
          </div>
          <div className="rounded-lg bg-card border border-border flex items-center gap-4 px-5 py-4">
            <div className="rounded-lg bg-[#EB5757]/10 p-3 shrink-0">
              <Eye className="h-5 w-5 text-[#EB5757]" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">Expiring Soon</p>
              <p className="text-2xl font-semibold font-mono-data text-[#EB5757]">8</p>
            </div>
          </div>
        </div>

        {/* Right: Compliance Trend Chart */}
        <div className="rounded-lg bg-card border border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-medium">Compliance Trend (30d)</h2>
          </div>
          <div className="px-5 py-4">
            <ResponsiveContainer width="100%" height={228}>
              <AreaChart data={complianceTrend}>
                <defs>
                  <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#777470" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis
                  tick={{ fontSize: 10, fill: "#777470" }}
                  axisLine={false}
                  tickLine={false}
                  domain={[96, 100]}
                  tickFormatter={(v: number) => `${v}%`}
                  width={40}
                />
                <Tooltip contentStyle={CHART_TOOLTIP} formatter={((v: number) => [`${v}%`, "Compliance"]) as never} />
                <Area type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={2} fill="url(#compGrad)" name="Compliance" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="n-tabbar">
        {(["policies", "access", "proofs"] as TabId[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`n-tabbar-btn ${tab === t ? "n-tabbar-btn--active" : ""}`}
          >
            {t === "access" ? "Access Logs" : t === "proofs" ? "Compliance Proofs" : "Policies"}
          </button>
        ))}
      </div>

      {/* Policies Tab */}
      {tab === "policies" && (
        <div className="animate-fadeIn space-y-4">
          <div className="hidden md:block rounded-lg bg-card border border-border overflow-hidden">
            <div className="grid grid-cols-[100px_1fr_1fr_140px_90px_120px] gap-4 px-5 py-2.5 bg-secondary text-xs text-muted-foreground border-b border-border">
              <span>Policy ID</span><span>Owner</span><span>Rules Hash</span><span>Type</span><span>Status</span><span>Created</span>
            </div>
            {pagedPolicies.map((p) => (
              <div key={p.policyId} className="row-hover grid grid-cols-[100px_1fr_1fr_140px_90px_120px] gap-4 px-5 py-2.5 border-b border-border last:border-0 items-center">
                <Link href={`/sovereignty/${p.policyId}`} className="font-mono-data text-primary hover:underline underline-offset-2">{p.policyId}</Link>
                <HashLink hash={p.owner} type="address" />
                <span className="font-mono-data text-xs text-muted-foreground truncate">{p.rulesHash}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium w-fit ${policyTypeColors[p.type] ?? ""}`}>
                  {p.type}
                </span>
                <StatusBadge status={p.status} />
                <TimeAgo timestamp={p.createdAt} />
              </div>
            ))}
          </div>
          <div className="md:hidden space-y-3">
            {pagedPolicies.map((p) => (
              <MobileCard
                key={p.policyId}
                rows={[
                  { label: "Policy ID", value: <Link href={`/sovereignty/${p.policyId}`} className="font-mono-data text-primary hover:underline underline-offset-2">{p.policyId}</Link> },
                  { label: "Type", value: <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${policyTypeColors[p.type] ?? ""}`}>{p.type}</span> },
                  { label: "Status", value: <StatusBadge status={p.status} /> },
                  { label: "Created", value: <TimeAgo timestamp={p.createdAt} /> },
                ]}
              />
            ))}
          </div>
          <Pagination
            currentPage={policiesPage}
            totalPages={policiesTotalPages}
            onPageChange={setPoliciesPage}
            pageSize={pageSize}
            totalItems={policiesTotal}
          />
        </div>
      )}

      {/* Access Logs Tab */}
      {tab === "access" && (
        <div className="animate-fadeIn space-y-4">
          <div className="hidden md:block rounded-lg bg-card border border-border overflow-hidden">
            <div className="grid grid-cols-[100px_100px_80px_1fr_130px_120px] gap-4 px-5 py-2.5 bg-secondary text-xs text-muted-foreground border-b border-border">
              <span>Event ID</span><span>Policy</span><span>Action</span><span>Grantee</span><span>Resource</span><span>Time</span>
            </div>
            {pagedAccess.map((log) => (
              <div key={log.eventId} className="row-hover grid grid-cols-[100px_100px_80px_1fr_130px_120px] gap-4 px-5 py-2.5 border-b border-border last:border-0 items-center">
                <span className="font-mono-data text-xs">{log.eventId}</span>
                <span className="font-mono-data text-primary text-xs">{log.policyId}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium w-fit ${
                  log.action === "grant" ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-[#EB5757]/10 text-[#EB5757]"
                }`}>
                  {log.action}
                </span>
                <HashLink hash={log.grantee} type="address" />
                <span className="font-mono-data text-xs text-muted-foreground">{log.resource}</span>
                <TimeAgo timestamp={log.timestamp} />
              </div>
            ))}
          </div>
          <div className="md:hidden space-y-3">
            {pagedAccess.map((log) => (
              <MobileCard
                key={log.eventId}
                rows={[
                  { label: "Event ID", value: <span className="font-mono-data">{log.eventId}</span> },
                  { label: "Action", value: <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${
                    log.action === "grant" ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-[#EB5757]/10 text-[#EB5757]"
                  }`}>{log.action}</span> },
                  { label: "Resource", value: <span className="font-mono-data text-xs">{log.resource}</span> },
                  { label: "Time", value: <TimeAgo timestamp={log.timestamp} /> },
                ]}
              />
            ))}
          </div>
          <Pagination
            currentPage={accessPage}
            totalPages={accessTotalPages}
            onPageChange={setAccessPage}
            pageSize={pageSize}
            totalItems={accessTotal}
          />
        </div>
      )}

      {/* Compliance Proofs Tab */}
      {tab === "proofs" && (
        <div className="animate-fadeIn space-y-4">
          <div className="hidden md:block rounded-lg bg-card border border-border overflow-hidden">
            <div className="grid grid-cols-[100px_100px_100px_1fr_90px_120px] gap-4 px-5 py-2.5 bg-secondary text-xs text-muted-foreground border-b border-border">
              <span>Proof ID</span><span>Policy</span><span>Type</span><span>Verifier</span><span>Status</span><span>Verified</span>
            </div>
            {pagedProofs.map((proof) => (
              <div key={proof.proofId} className="row-hover grid grid-cols-[100px_100px_100px_1fr_90px_120px] gap-4 px-5 py-2.5 border-b border-border last:border-0 items-center">
                <span className="font-mono-data text-xs">{proof.proofId}</span>
                <span className="font-mono-data text-primary text-xs">{proof.policyId}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium w-fit ${proofTypeColors[proof.type] ?? ""}`}>
                  {proof.type}
                </span>
                <HashLink hash={proof.verifier} type="address" />
                <StatusBadge status={proof.status} />
                <TimeAgo timestamp={proof.verifiedAt} />
              </div>
            ))}
          </div>
          <div className="md:hidden space-y-3">
            {pagedProofs.map((proof) => (
              <MobileCard
                key={proof.proofId}
                rows={[
                  { label: "Proof ID", value: <span className="font-mono-data">{proof.proofId}</span> },
                  { label: "Type", value: <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${proofTypeColors[proof.type] ?? ""}`}>{proof.type}</span> },
                  { label: "Status", value: <StatusBadge status={proof.status} /> },
                  { label: "Verified", value: <TimeAgo timestamp={proof.verifiedAt} /> },
                ]}
              />
            ))}
          </div>
          <Pagination
            currentPage={proofsPage}
            totalPages={proofsTotalPages}
            onPageChange={setProofsPage}
            pageSize={pageSize}
            totalItems={proofsTotal}
          />
        </div>
      )}
    </div>
  );
}
