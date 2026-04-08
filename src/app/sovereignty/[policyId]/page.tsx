"use client";

import { use, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, Copy, Check } from "lucide-react";
import { HashLink } from "@/components/hash-link";
import { StatusBadge } from "@/components/status-badge";
import { TimeAgo } from "@/components/time-ago";
import { Pagination } from "@/components/pagination";
import { MobileCard } from "@/components/mobile-card";
import { showToast } from "@/components/toast";

// ─── Mock Data ──────────────────────────────────────────────────────────────

const ANCHOR = new Date("2026-04-05T10:00:00.000Z").getTime();
const hour = 3600_000;
const day = 86400_000;
const ts = (offset: number) => new Date(ANCHOR - offset).toISOString();

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

function getPolicyData(policyId: string) {
  const num = parseInt(policyId.replace("POL-", ""), 10);
  const i = num - 3000;
  const types = ["data-retention", "access-control", "privacy", "geo-restriction"] as const;
  const statuses = i === 2 ? "expired" : i === 10 ? "draft" : "active";

  return {
    policyId,
    owner: `0x${(0x4a5b + i * 0x17).toString(16).padStart(4, "0")}C3d4E5f6A7b8C9d0E1f2A3b4C5d6E7f8`,
    rulesHash: `ipfs://Qm${(0xccdd + i).toString(16).padStart(6, "0")}a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8`,
    type: types[Math.abs(i) % 4],
    status: statuses,
    createdAt: ts(Math.abs(i) * day * 1.5 + (((Math.abs(i) * 7919 + 31) % 997) / 997) * hour * 6),
    updatedAt: ts(Math.abs(i) * day * 0.5),
    rules: {
      retention_period: "90 days",
      encryption: "AES-256",
      access_scope: "organization",
      geo_restriction: "EU-only",
    },
  };
}

function getAccessLogs(policyId: string) {
  return Array.from({ length: 12 }, (_, i) => ({
    eventId: `EVT-${(7000 + i).toString()}`,
    policyId: `POL-${(3000 + (i % 6)).toString()}`,
    action: i % 3 === 0 ? "revoke" : "grant",
    grantee: `0x${(0x8c9d + i * 0x21).toString(16).padStart(4, "0")}F6a7B8c9D0e1F2a3B4c5D6e7F8a9B0c1`,
    resource: ["user-data-v2", "telemetry-stream", "model-weights", "device-logs", "tx-history", "auth-tokens"][i % 6],
    timestamp: ts(i * hour * 3 + (((i * 7919 + 31) % 997) / 997) * hour),
  })).filter((log) => log.policyId === policyId);
}

function getComplianceProofs(policyId: string) {
  return Array.from({ length: 12 }, (_, i) => ({
    proofId: `ZKP-${(9000 + i).toString()}`,
    policyId: `POL-${(3000 + (i % 5)).toString()}`,
    type: (["zk-snark", "zk-stark", "merkle"] as const)[i % 3],
    verifier: `0x${(0x1e2f + i * 0x14).toString(16).padStart(4, "0")}D4e5F6a7B8c9D0e1F2a3B4c5D6e7F8a9`,
    status: i === 4 ? "pending" : i === 9 ? "failed" : "verified",
    verifiedAt: ts(i * hour * 4 + (((i * 7919 + 31) % 997) / 997) * hour * 2),
  })).filter((proof) => proof.policyId === policyId);
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function PolicyDetailPage({
  params,
}: {
  params: Promise<{ policyId: string }>;
}) {
  const { policyId } = use(params);
  const [copiedHash, setCopiedHash] = useState(false);
  const [accessPage, setAccessPage] = useState(1);
  const [proofsPage, setProofsPage] = useState(1);
  const pageSize = 5;

  const policy = getPolicyData(policyId);
  const accessLogs = getAccessLogs(policyId);
  const complianceProofs = getComplianceProofs(policyId);

  const accessTotalPages = Math.ceil(accessLogs.length / pageSize);
  const pagedAccess = accessLogs.slice((accessPage - 1) * pageSize, accessPage * pageSize);

  const proofsTotalPages = Math.ceil(complianceProofs.length / pageSize);
  const pagedProofs = complianceProofs.slice((proofsPage - 1) * pageSize, proofsPage * pageSize);

  const handleCopyHash = async () => {
    await navigator.clipboard.writeText(policy.rulesHash);
    setCopiedHash(true);
    showToast("Rules hash copied to clipboard");
    setTimeout(() => setCopiedHash(false), 1500);
  };

  const timelineEvents = [
    { label: "Policy Created", timestamp: policy.createdAt, status: "done" as const },
    { label: "First Audit Passed", timestamp: ts(day * 8), status: "done" as const },
    { label: "Access Grant Issued", timestamp: ts(day * 5), status: "done" as const },
    { label: "Compliance Renewed", timestamp: ts(day * 1), status: policy.status === "expired" ? "pending" as const : "done" as const },
  ];

  return (
    <div className="max-w-[1480px] mx-auto px-2.5 py-2 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight font-mono-data">
            {policyId}
          </h1>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${
              policyTypeColors[policy.type] ?? ""
            }`}
          >
            {policy.type}
          </span>
          <StatusBadge status={policy.status} />
        </div>
      </div>

      {/* Policy Details Card */}
      <div className="rounded-lg bg-card border border-border p-5">
        <h2 className="text-sm font-medium mb-4">Policy Details</h2>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Policy ID</span>
            <span className="font-mono-data text-xs">{policy.policyId}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Owner</span>
            <HashLink hash={policy.owner} type="address" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Rules Hash</span>
            <span className="inline-flex items-center gap-1 group">
              <span className="font-mono-data text-xs text-muted-foreground">
                {policy.rulesHash.slice(0, 20)}...{policy.rulesHash.slice(-8)}
              </span>
              <button
                onClick={handleCopyHash}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                title="Copy"
              >
                {copiedHash ? (
                  <Check className="h-3 w-3 text-[#22C55E]" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Type</span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${
                policyTypeColors[policy.type] ?? ""
              }`}
            >
              {policy.type}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <StatusBadge status={policy.status} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Created</span>
            <TimeAgo timestamp={policy.createdAt} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last Updated</span>
            <TimeAgo timestamp={policy.updatedAt} />
          </div>
        </div>
      </div>

      {/* Policy Rules */}
      <div className="rounded-lg bg-card border border-border p-5">
        <h2 className="text-sm font-medium mb-4">Policy Rules</h2>
        <div className="rounded-md bg-secondary p-4 space-y-1.5">
          {Object.entries(policy.rules).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="font-mono-data text-xs text-primary">
                {key}:
              </span>
              <span className="font-mono-data text-xs text-foreground">
                &quot;{value}&quot;
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Access History */}
      {accessLogs.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">
            Access History
          </h2>
          <div className="hidden md:block rounded-lg bg-card border border-border overflow-hidden">
            <div className="grid grid-cols-[100px_80px_1fr_130px_120px] gap-4 px-5 py-2.5 bg-secondary text-xs text-muted-foreground border-b border-border">
              <span>Event ID</span>
              <span>Action</span>
              <span>Grantee</span>
              <span>Resource</span>
              <span className="text-right">Time</span>
            </div>
            {pagedAccess.map((log) => (
              <div
                key={log.eventId}
                className="row-hover grid grid-cols-[100px_80px_1fr_130px_120px] gap-4 px-5 py-2.5 border-b border-border last:border-0 items-center"
              >
                <span className="font-mono-data text-xs">{log.eventId}</span>
                <span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium w-fit ${
                      log.action === "grant"
                        ? "bg-[#22C55E]/10 text-[#22C55E]"
                        : "bg-[#EB5757]/10 text-[#EB5757]"
                    }`}
                  >
                    {log.action}
                  </span>
                </span>
                <HashLink hash={log.grantee} type="address" />
                <span className="font-mono-data text-xs text-muted-foreground">
                  {log.resource}
                </span>
                <span className="text-right">
                  <TimeAgo timestamp={log.timestamp} />
                </span>
              </div>
            ))}
          </div>
          <div className="md:hidden space-y-3">
            {pagedAccess.map((log) => (
              <MobileCard
                key={log.eventId}
                rows={[
                  { label: "Event ID", value: <span className="font-mono-data">{log.eventId}</span> },
                  {
                    label: "Action",
                    value: (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${
                          log.action === "grant"
                            ? "bg-[#22C55E]/10 text-[#22C55E]"
                            : "bg-[#EB5757]/10 text-[#EB5757]"
                        }`}
                      >
                        {log.action}
                      </span>
                    ),
                  },
                  { label: "Resource", value: <span className="font-mono-data text-xs">{log.resource}</span> },
                  { label: "Time", value: <TimeAgo timestamp={log.timestamp} /> },
                ]}
              />
            ))}
          </div>
          {accessTotalPages > 1 && (
            <div className="mt-3">
              <Pagination
                currentPage={accessPage}
                totalPages={accessTotalPages}
                onPageChange={setAccessPage}
                pageSize={pageSize}
                totalItems={accessLogs.length}
              />
            </div>
          )}
        </div>
      )}

      {/* Linked Compliance Proofs */}
      {complianceProofs.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">
            Linked Compliance Proofs
          </h2>
          <div className="hidden md:block rounded-lg bg-card border border-border overflow-hidden">
            <div className="grid grid-cols-[100px_100px_1fr_90px_120px] gap-4 px-5 py-2.5 bg-secondary text-xs text-muted-foreground border-b border-border">
              <span>Proof ID</span>
              <span>Type</span>
              <span>Verifier</span>
              <span>Status</span>
              <span className="text-right">Verified At</span>
            </div>
            {pagedProofs.map((proof) => (
              <div
                key={proof.proofId}
                className="row-hover grid grid-cols-[100px_100px_1fr_90px_120px] gap-4 px-5 py-2.5 border-b border-border last:border-0 items-center"
              >
                <span className="font-mono-data text-xs">{proof.proofId}</span>
                <span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium w-fit ${
                      proofTypeColors[proof.type] ?? ""
                    }`}
                  >
                    {proof.type}
                  </span>
                </span>
                <HashLink hash={proof.verifier} type="address" />
                <StatusBadge status={proof.status} />
                <span className="text-right">
                  <TimeAgo timestamp={proof.verifiedAt} />
                </span>
              </div>
            ))}
          </div>
          <div className="md:hidden space-y-3">
            {pagedProofs.map((proof) => (
              <MobileCard
                key={proof.proofId}
                rows={[
                  { label: "Proof ID", value: <span className="font-mono-data">{proof.proofId}</span> },
                  {
                    label: "Type",
                    value: (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${
                          proofTypeColors[proof.type] ?? ""
                        }`}
                      >
                        {proof.type}
                      </span>
                    ),
                  },
                  { label: "Status", value: <StatusBadge status={proof.status} /> },
                  { label: "Verified", value: <TimeAgo timestamp={proof.verifiedAt} /> },
                ]}
              />
            ))}
          </div>
          {proofsTotalPages > 1 && (
            <div className="mt-3">
              <Pagination
                currentPage={proofsPage}
                totalPages={proofsTotalPages}
                onPageChange={setProofsPage}
                pageSize={pageSize}
                totalItems={complianceProofs.length}
              />
            </div>
          )}
        </div>
      )}

      {/* Compliance Status Timeline */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-2">
          Compliance Status Timeline
        </h2>
        <div className="rounded-lg bg-card border border-border p-5">
          <div className="space-y-0">
            {timelineEvents.map((event, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full border border-border bg-card">
                    {event.status === "done" ? (
                      <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
                    ) : (
                      <Clock className="h-4 w-4 text-[#EB5757]" />
                    )}
                  </div>
                  {i < timelineEvents.length - 1 && (
                    <div className="w-px h-8 bg-border" />
                  )}
                </div>
                <div className="pb-6">
                  <p
                    className={`text-sm font-medium ${
                      event.status === "done"
                        ? "text-foreground"
                        : "text-[#EB5757]"
                    }`}
                  >
                    {event.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(event.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
