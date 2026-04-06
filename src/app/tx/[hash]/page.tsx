"use client";

import { use, useState } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { HashLink } from "@/components/hash-link";
import { TimeAgo } from "@/components/time-ago";
import { StatusBadge } from "@/components/status-badge";
import {
  transactionsExtended,
  internalTransactions,
  eventLogs,
} from "@/lib/mock-data";
import { DevModeSection } from "@/components/dev-mode-section";
import { ShareButton } from "@/components/share-button";
import { MobileCard } from "@/components/mobile-card";

const statusIcon = {
  confirmed: <CheckCircle className="h-4 w-4 text-[#22C55E]" />,
  pending: <Clock className="h-4 w-4 text-[#F2994A]" />,
  failed: <XCircle className="h-4 w-4 text-[#EB5757]" />,
};

type Tab = "overview" | "internal" | "logs";

function truncate(s: string, len = 20) {
  return s.length > len ? s.slice(0, len) + "..." : s;
}

const internalTypeBadge: Record<string, string> = {
  call: "bg-[#6E9FFF]/10 text-[#6E9FFF]",
  create: "bg-[#22C55E]/10 text-[#22C55E]",
  delegatecall: "bg-[#FFC933]/10 text-[#FFC933]",
};

export default function TxDetailPage({
  params,
}: {
  params: Promise<{ hash: string }>;
}) {
  const { hash } = use(params);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const tx = transactionsExtended.find((t) => t.hash === hash);
  if (!tx) {
    return (
      <div className="px-2.5 py-4">
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <img src="/brand/3d/bee-dark.png" alt="" className="h-20 w-auto opacity-50 mb-4" />
          <h1 className="text-lg font-semibold mb-1">Transaction Not Found</h1>
          <p className="text-sm text-muted-foreground mb-4">Transaction {hash.slice(0, 10)}... does not exist.</p>
          <Link href="/transactions" className="text-sm text-primary hover:underline">View all transactions</Link>
        </div>
      </div>
    );
  }

  const txInternals = internalTransactions.filter((it) => it.txHash === hash);
  const txLogs = eventLogs.filter((l) => l.txHash === hash);

  // Gas utilization
  const gasLimit = 30_000_000;
  const gasUtilization = (tx.gasUsed / gasLimit) * 100;

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "internal", label: "Internal Txs", count: txInternals.length },
    { key: "logs", label: "Event Logs", count: txLogs.length },
  ];

  const rows = [
    {
      label: "Transaction Hash",
      value: <HashLink hash={tx.hash} type="tx" truncate={false} />,
    },
    {
      label: "Status",
      value: (
        <div className="flex items-center gap-2">
          {statusIcon[tx.status]}
          <StatusBadge status={tx.status} />
        </div>
      ),
    },
    {
      label: "Block",
      value: (
        <Link
          href={`/blocks/${tx.blockNumber}`}
          className="font-mono-data text-foreground hover:text-primary transition-colors"
        >
          #{tx.blockNumber.toLocaleString()}
        </Link>
      ),
    },
    { label: "Timestamp", value: <TimeAgo timestamp={tx.timestamp} /> },
    { label: "From", value: <HashLink hash={tx.from} type="address" /> },
    { label: "To", value: <HashLink hash={tx.to} type="address" /> },
    {
      label: "Value",
      value: <span className="font-mono-data">{tx.value} NECTA</span>,
    },
    {
      label: "Type",
      value: <StatusBadge status={tx.type.replace("_", " ")} />,
    },
    {
      label: "Method",
      value: (
        <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium bg-secondary text-foreground font-mono-data">
          {tx.methodName}
        </span>
      ),
    },
    {
      label: "Gas Used",
      value: (
        <div className="flex items-center gap-3">
          <span className="font-mono-data">{tx.gasUsed.toLocaleString()}</span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  gasUtilization > 80
                    ? "bg-[#FFC933]"
                    : gasUtilization > 60
                    ? "bg-[#22C55E]"
                    : "bg-muted-foreground/40"
                }`}
                style={{ width: `${Math.min(gasUtilization, 100)}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {gasUtilization.toFixed(1)}%
            </span>
          </div>
        </div>
      ),
    },
    {
      label: "Transaction Fee",
      value: <span className="font-mono-data">{tx.fee} NECTA</span>,
    },
    {
      label: "Nonce",
      value: <span className="font-mono-data">{tx.nonce}</span>,
    },
  ];

  return (
    <div className="px-2.5 py-2 space-y-4">

      <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
        Transaction Details
        <ShareButton />
      </h1>

      {/* Tabs */}
      <div className="n-tabbar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`n-tabbar-btn ${activeTab === tab.key ? "n-tabbar-btn--active" : ""}`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1.5 text-[10px] text-muted-foreground">
                ({tab.count})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          <div className="rounded-lg bg-card border border-border overflow-hidden">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center py-3 px-5 border-b border-border last:border-0"
              >
                <span className="text-sm text-muted-foreground w-44 shrink-0">
                  {row.label}
                </span>
                <span className="text-sm">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Decoded Input Parameters */}
          <div className="rounded-lg bg-card border border-border overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <h2 className="text-sm font-medium">Decoded Input Data</h2>
            </div>
            <div className="px-5 py-2.5 border-b border-border flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Function:</span>
              <span className="inline-flex px-2 py-0.5 rounded-[3px] text-[11px] font-medium bg-secondary font-mono-data">
                {tx.methodName}({tx.type === "transfer" ? "address to, uint256 amount" : tx.type === "stake" ? "uint256 amount" : tx.type === "governance" ? "uint256 proposalId, bool support" : "bytes data"})
              </span>
            </div>
            {/* Mobile decoded input */}
            <div className="md:hidden space-y-3 p-4">
              {(tx.type === "transfer" ? [
                { name: "to", type: "address", value: tx.to },
                { name: "amount", type: "uint256", value: `${tx.value} (${tx.value} NECTA)` },
              ] : tx.type === "stake" ? [
                { name: "amount", type: "uint256", value: `${tx.value} (${tx.value} NECTA)` },
                { name: "lockDuration", type: "uint256", value: "7776000 (90 days)" },
              ] : tx.type === "governance" ? [
                { name: "proposalId", type: "uint256", value: "42" },
                { name: "support", type: "bool", value: "true (For)" },
              ] : tx.type === "job_post" ? [
                { name: "description", type: "string", value: `"${tx.methodName}"` },
                { name: "reward", type: "uint256", value: `${tx.value} (${tx.value} NECTA)` },
                { name: "proofType", type: "uint8", value: "2 (ZK)" },
              ] : [
                { name: "data", type: "bytes", value: "0x23b872dd..." },
              ]).map((param, i) => (
                <MobileCard
                  key={i}
                  rows={[
                    { label: "Name", value: <span className="font-mono-data text-[#FFC933]">{param.name}</span> },
                    { label: "Type", value: <span className="font-mono-data text-[#9985FF]">{param.type}</span> },
                    { label: "Value", value: <span className="font-mono-data text-xs break-all">{param.type === "address" ? <HashLink hash={param.value} type="address" /> : param.value}</span> },
                  ]}
                />
              ))}
            </div>
            {/* Desktop decoded input */}
            <div className="hidden md:block">
              <div className="grid grid-cols-[30px_120px_100px_1fr] gap-3 px-5 py-2 text-[11px] text-muted-foreground uppercase tracking-wider border-b border-border">
                <span>#</span><span>Name</span><span>Type</span><span>Value</span>
              </div>
              {(tx.type === "transfer" ? [
                { name: "to", type: "address", value: tx.to },
                { name: "amount", type: "uint256", value: `${tx.value} (${tx.value} NECTA)` },
              ] : tx.type === "stake" ? [
                { name: "amount", type: "uint256", value: `${tx.value} (${tx.value} NECTA)` },
                { name: "lockDuration", type: "uint256", value: "7776000 (90 days)" },
              ] : tx.type === "governance" ? [
                { name: "proposalId", type: "uint256", value: "42" },
                { name: "support", type: "bool", value: "true (For)" },
              ] : tx.type === "job_post" ? [
                { name: "description", type: "string", value: `"${tx.methodName}"` },
                { name: "reward", type: "uint256", value: `${tx.value} (${tx.value} NECTA)` },
                { name: "proofType", type: "uint8", value: "2 (ZK)" },
              ] : [
                { name: "data", type: "bytes", value: "0x23b872dd..." },
              ]).map((param, i) => (
                <div key={i} className="row-hover grid grid-cols-[30px_120px_100px_1fr] gap-3 items-center px-5 py-2.5 border-b border-border last:border-0">
                  <span className="font-mono-data text-xs text-muted-foreground">{i}</span>
                  <span className="font-mono-data text-sm text-[#FFC933]">{param.name}</span>
                  <span className="font-mono-data text-xs text-[#9985FF]">{param.type}</span>
                  <span className="font-mono-data text-xs break-all">
                    {param.type === "address" ? <HashLink hash={param.value} type="address" /> : param.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <DevModeSection label="Developer Data">
            <div className="space-y-5">
              {/* Raw Input Data */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Raw Input Data</p>
                <div className="bg-background rounded-md p-3 overflow-x-auto">
                  <code className="text-xs font-mono-data text-foreground break-all">
                    0x23b872dd0000000000000000000000004f3e8f405cf5afc05d68142f3327e0b82f3e4db700000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d00000000000000000000000000000000000000000000003635c9adc5dea00000
                  </code>
                </div>
              </div>

              {/* Storage Slots Accessed */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Storage Slots Accessed</p>
                <div className="space-y-1">
                  {[
                    "0x0000000000000000000000000000000000000000000000000000000000000003",
                    "0x0000000000000000000000000000000000000000000000000000000000000007",
                    "0x000000000000000000000000000000000000000000000000000000000000000a",
                  ].map((slot, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground font-mono-data w-6">#{i}</span>
                      <code className="text-xs font-mono-data text-foreground">{slot}</code>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gas Trace */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Gas Trace</p>
                <div className="bg-background rounded-md p-3 overflow-x-auto">
                  <div className="space-y-1 text-xs font-mono-data">
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground w-16">PUSH1</span>
                      <span className="text-foreground">gas: 3</span>
                      <span className="text-muted-foreground">cumulative: 3</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground w-16">SLOAD</span>
                      <span className="text-foreground">gas: 2,100</span>
                      <span className="text-muted-foreground">cumulative: 2,103</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground w-16">CALL</span>
                      <span className="text-foreground">gas: 9,400</span>
                      <span className="text-muted-foreground">cumulative: 11,503</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground w-16">SSTORE</span>
                      <span className="text-foreground">gas: 20,000</span>
                      <span className="text-muted-foreground">cumulative: 31,503</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground w-16">LOG3</span>
                      <span className="text-foreground">gas: 1,756</span>
                      <span className="text-muted-foreground">cumulative: 33,259</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DevModeSection>
        </>
      )}

      {/* Internal Txs Tab */}
      {activeTab === "internal" && (
        <div>
          {txInternals.length === 0 ? (
            <div className="rounded-lg bg-card border border-border">
              <p className="text-sm text-muted-foreground px-5 py-8 text-center">
                No internal transactions found for this hash.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile */}
              <div className="md:hidden space-y-3">
                {txInternals.map((it, i) => (
                  <MobileCard
                    key={i}
                    rows={[
                      { label: "Type", value: <span className={`inline-flex px-1.5 py-0.5 rounded-[3px] text-[11px] font-medium ${internalTypeBadge[it.type] ?? "bg-secondary text-muted-foreground"}`}>{it.type}</span> },
                      { label: "From", value: <HashLink hash={it.from} type="address" /> },
                      { label: "To", value: <HashLink hash={it.to} type="address" /> },
                      { label: "Value", value: <span className="font-mono-data">{it.value} NECTA</span> },
                    ]}
                  />
                ))}
              </div>
              {/* Desktop */}
              <div className="hidden md:block rounded-lg bg-card border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-5 py-2.5 text-left text-[11px] text-muted-foreground uppercase tracking-wider font-normal">Type</th>
                        <th className="px-5 py-2.5 text-left text-[11px] text-muted-foreground uppercase tracking-wider font-normal">From</th>
                        <th className="px-5 py-2.5 text-left text-[11px] text-muted-foreground uppercase tracking-wider font-normal">To</th>
                        <th className="px-5 py-2.5 text-right text-[11px] text-muted-foreground uppercase tracking-wider font-normal">Value</th>
                        <th className="px-5 py-2.5 text-right text-[11px] text-muted-foreground uppercase tracking-wider font-normal">Depth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {txInternals.map((it, i) => (
                        <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary transition-colors">
                          <td className="px-5 py-2.5" style={{ paddingLeft: `${20 + it.depth * 16}px` }}>
                            <span className={`inline-flex px-1.5 py-0.5 rounded-[3px] text-[11px] font-medium ${internalTypeBadge[it.type] ?? "bg-secondary text-muted-foreground"}`}>{it.type}</span>
                          </td>
                          <td className="px-5 py-2.5"><HashLink hash={it.from} type="address" /></td>
                          <td className="px-5 py-2.5"><HashLink hash={it.to} type="address" /></td>
                          <td className="px-5 py-2.5 text-right font-mono-data">{it.value} NECTA</td>
                          <td className="px-5 py-2.5 text-right font-mono-data text-muted-foreground">{it.depth}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Event Logs Tab */}
      {activeTab === "logs" && (
        <div>
          {txLogs.length === 0 ? (
            <div className="rounded-lg bg-card border border-border">
              <p className="text-sm text-muted-foreground px-5 py-8 text-center">
                No event logs found for this hash.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile */}
              <div className="md:hidden space-y-3">
                {txLogs.map((log) => (
                  <MobileCard
                    key={log.logIndex}
                    rows={[
                      { label: "Event", value: <span className="inline-flex px-1.5 py-0.5 rounded-[3px] text-[11px] font-medium bg-[#9985FF]/10 text-[#9985FF]">{log.eventName}</span> },
                      { label: "Contract", value: <HashLink hash={log.address} type="address" /> },
                      { label: "Block", value: <span className="font-mono-data text-xs">#{log.blockNumber.toLocaleString()}</span> },
                    ]}
                  />
                ))}
              </div>
              {/* Desktop */}
              <div className="hidden md:block rounded-lg bg-card border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-5 py-2.5 text-left text-[11px] text-muted-foreground uppercase tracking-wider font-normal">Log Index</th>
                        <th className="px-5 py-2.5 text-left text-[11px] text-muted-foreground uppercase tracking-wider font-normal">Contract</th>
                        <th className="px-5 py-2.5 text-left text-[11px] text-muted-foreground uppercase tracking-wider font-normal">Event</th>
                        <th className="px-5 py-2.5 text-left text-[11px] text-muted-foreground uppercase tracking-wider font-normal">Topics</th>
                        <th className="px-5 py-2.5 text-left text-[11px] text-muted-foreground uppercase tracking-wider font-normal">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {txLogs.map((log) => (
                        <tr key={log.logIndex} className="border-b border-border last:border-0 hover:bg-secondary transition-colors">
                          <td className="px-5 py-2.5 font-mono-data text-muted-foreground">{log.logIndex}</td>
                          <td className="px-5 py-2.5"><HashLink hash={log.address} type="address" /></td>
                          <td className="px-5 py-2.5"><span className="inline-flex px-1.5 py-0.5 rounded-[3px] text-[11px] font-medium bg-[#9985FF]/10 text-[#9985FF]">{log.eventName}</span></td>
                          <td className="px-5 py-2.5 font-mono-data text-xs text-muted-foreground">{truncate(log.topics[0], 24)}</td>
                          <td className="px-5 py-2.5 font-mono-data text-xs text-muted-foreground">{truncate(log.data, 24)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
