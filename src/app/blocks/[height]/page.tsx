"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useRouter } from "next/navigation";
import { HashLink } from "@/components/hash-link";
import { TimeAgo } from "@/components/time-ago";
import { StatusBadge } from "@/components/status-badge";
import { ShareButton } from "@/components/share-button";
import { MobileCard } from "@/components/mobile-card";
import { PageTitle } from "@/components/page-title";
import { blocks, blocksExtended, transactions, eventLogs } from "@/lib/mock-data";

const CHART_TOOLTIP = {
  backgroundColor: "#131315",
  border: "1px solid rgba(255,245,230,0.07)",
  borderRadius: 8,
  fontSize: 12,
  color: "#F9F9F6",
};

type Tab = "transactions" | "events" | "state";

// Mock state changes per block
function mockStateChanges(blockHeight: number) {
  const seed = blockHeight % 100;
  return Array.from({ length: 5 }, (_, i) => ({
    address: `0x${((seed + i) * 0x1a2b).toString(16).padStart(8, "0")}C3d4E5f6A7b8C9d0E1f2`,
    slot: `0x${(i * 3 + seed).toString(16).padStart(2, "0")}`,
    prev: `0x${((seed + i * 7) * 1234).toString(16).padStart(64, "0")}`,
    next: `0x${((seed + i * 7 + 1) * 1234).toString(16).padStart(64, "0")}`,
  }));
}

export default function BlockDetailPage({ params }: { params: Promise<{ height: string }> }) {
  const { height } = use(params);
  const [tab, setTab] = useState<Tab>("transactions");
  const router = useRouter();

  const block = blocksExtended.find((b) => b.height.toString() === height) ?? blocks.find((b) => b.height.toString() === height);
  if (!block) {
    return (
      <div className="px-2.5 py-4">
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <img src="/brand/3d/bee-dark.png" alt="" className="h-20 w-auto opacity-50 mb-4" />
          <h1 className="text-xl font-semibold mb-1">Block Not Found</h1>
          <p className="text-sm text-muted-foreground mb-4">Block #{height} does not exist.</p>
          <Link href="/blocks" className="text-sm text-primary hover:underline">View all blocks</Link>
        </div>
      </div>
    );
  }

  const blockTxs = transactions.filter((tx) => tx.blockNumber === block.height);
  const blockEvents = eventLogs.filter((e) => e.blockNumber === block.height).slice(0, 8);
  const stateChanges = mockStateChanges(block.height);

  // Gas breakdown by tx type
  const gasByType: Record<string, number> = {};
  for (const tx of blockTxs) {
    const label = tx.type.replace("_", " ");
    gasByType[label] = (gasByType[label] ?? 0) + tx.gasUsed;
  }
  const gasChartData = Object.entries(gasByType).map(([name, value]) => ({ name, value }));
  const gasColors: Record<string, string> = {
    transfer: "#FFC933",
    "contract call": "#6E9FFF",
    "job post": "#EB5757",
    attestation: "#22C55E",
    stake: "#9b8b5b",
    governance: "#777470",
  };

  // Block rewards breakdown
  const baseFee = block.gasUsed * 0.000000001;
  const priorityFee = baseFee * 0.3;
  const burnedFee = baseFee * 0.1;
  const totalReward = baseFee + priorityFee - burnedFee;

  const rows = [
    { label: "Block Height", value: <span className="font-mono-data">#{block.height.toLocaleString()}</span> },
    { label: "Block Hash", value: <HashLink hash={block.hash} type="block" truncate={false} /> },
    { label: "Timestamp", value: <TimeAgo timestamp={block.timestamp} /> },
    { label: "Proposer", value: <HashLink hash={block.proposer} type="address" /> },
    { label: "Parent Hash", value: <HashLink hash={block.parentHash} type="block" /> },
    { label: "Transactions", value: <span className="font-mono-data">{block.txCount}</span> },
    { label: "Gas Used / Limit", value: <span className="font-mono-data">{(block.gasUsed / 1_000_000).toFixed(2)}M / {block.gasLimit / 1_000_000}M ({((block.gasUsed / block.gasLimit) * 100).toFixed(1)}%)</span> },
    { label: "ZK Proof Anchor", value: <span className="font-mono-data text-[#6E9FFF]">{block.zkProofAnchor}</span> },
    { label: "L1 Settlement", value: <span className="inline-flex px-1.5 py-0.5 rounded-[3px] text-[11px] font-medium bg-[#22C55E]/10 text-[#22C55E]">Settled</span> },
  ];

  return (
    <div className="max-w-[1480px] mx-auto px-2.5 py-2 space-y-4">
      <PageTitle title={`Block #${block.height}`} />
      <Link href="/blocks" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 w-fit">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Blocks
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
          Block #{block.height.toLocaleString()}
          <ShareButton />
        </h1>
      </div>

      {/* Overview + Gas Breakdown side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* Block Details */}
        <div className="rounded-lg bg-card border border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-medium">Block Details</h2>
          </div>
          {rows.map((row) => (
            <div key={row.label} className="flex items-center py-2.5 px-5 border-b border-border last:border-0">
              <span className="text-sm text-muted-foreground w-40 shrink-0">{row.label}</span>
              <span className="text-sm">{row.value}</span>
            </div>
          ))}
        </div>

        {/* Gas Breakdown + Rewards */}
        <div className="space-y-4">
          {/* Gas Pie */}
          <div className="rounded-lg bg-card border border-border p-5">
            <h2 className="text-sm font-medium mb-3">Gas by Transaction Type</h2>
            {gasChartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={gasChartData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={2} stroke="none">
                      {gasChartData.map((entry) => (
                        <Cell key={entry.name} fill={gasColors[entry.name] ?? "#A8A89C"} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={CHART_TOOLTIP} formatter={((v: number) => [`${(v / 1000).toFixed(1)}K gas`, ""]) as never} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {gasChartData.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: gasColors[entry.name] ?? "#A8A89C" }} />
                        <span className="capitalize text-muted-foreground">{entry.name}</span>
                      </div>
                      <span className="font-mono-data">{(entry.value / 1000).toFixed(1)}K</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">No transactions in this block</p>
            )}
          </div>

          {/* Block Rewards */}
          <div className="rounded-lg bg-card border border-border p-5">
            <h2 className="text-sm font-medium mb-3">Block Rewards</h2>
            <div className="space-y-2">
              {[
                { label: "Base Fee", value: `${baseFee.toFixed(6)} NECTA`, color: "" },
                { label: "Priority Fees", value: `${priorityFee.toFixed(6)} NECTA`, color: "text-[#22C55E]" },
                { label: "Burned", value: `-${burnedFee.toFixed(6)} NECTA`, color: "text-[#EB5757]" },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{r.label}</span>
                  <span className={`font-mono-data ${r.color}`}>{r.value}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2 flex items-center justify-between text-sm font-medium">
                <span>Total Reward</span>
                <span className="font-mono-data text-primary">{totalReward.toFixed(6)} NECTA</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Transactions | Event Logs | State Changes */}
      <div className="n-tabbar">
        {([
          { id: "transactions" as Tab, label: `Transactions (${blockTxs.length})` },
          { id: "events" as Tab, label: `Event Logs (${blockEvents.length})` },
          { id: "state" as Tab, label: `State Changes (${stateChanges.length})` },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`n-tabbar-btn ${tab === t.id ? "n-tabbar-btn--active" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Transactions Tab */}
      {tab === "transactions" && (
        <div className="animate-fadeIn">
          {blockTxs.length > 0 ? (
            <>
              {/* Mobile */}
              <div className="md:hidden space-y-3">
                {blockTxs.map((tx) => (
                  <MobileCard
                    key={tx.hash}
                    onClick={() => router.push(`/tx/${tx.hash}`)}
                    rows={[
                      { label: "Hash", value: <HashLink hash={tx.hash} type="tx" /> },
                      { label: "Type", value: <StatusBadge status={tx.type.replace("_", " ")} /> },
                      { label: "Value", value: <span className="font-mono-data">{tx.value} NECTA</span> },
                    ]}
                  />
                ))}
              </div>
              {/* Desktop */}
              <div className="hidden md:block rounded-lg bg-card border border-border overflow-hidden">
                <div className="grid grid-cols-[1fr_1fr_100px_120px_80px] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
                  <span>Hash</span><span>To</span><span>Type</span><span className="text-right">Value</span><span className="text-right">Fee</span>
                </div>
                {blockTxs.map((tx) => (
                  <div key={tx.hash} className="row-hover grid grid-cols-[1fr_1fr_100px_120px_80px] gap-3 items-center px-5 py-2.5 border-b border-border last:border-0">
                    <HashLink hash={tx.hash} type="tx" />
                    <HashLink hash={tx.to} type="address" />
                    <StatusBadge status={tx.type.replace("_", " ")} />
                    <span className="text-right font-mono-data text-sm">{tx.value} NECTA</span>
                    <span className="text-right font-mono-data text-xs text-muted-foreground">{tx.fee}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-lg bg-card border border-border px-5 py-8 text-center text-sm text-muted-foreground">No transactions in this block</div>
          )}
        </div>
      )}

      {/* Event Logs Tab */}
      {tab === "events" && (
        <div className="animate-fadeIn">
          {blockEvents.length > 0 ? (
            <>
              {/* Mobile */}
              <div className="md:hidden space-y-3">
                {blockEvents.map((log) => (
                  <MobileCard
                    key={log.logIndex}
                    rows={[
                      { label: "Event", value: <span className="inline-flex px-1.5 py-0.5 rounded-[3px] text-[11px] font-medium bg-[#6E9FFF]/10 text-[#6E9FFF]">{log.eventName}</span> },
                      { label: "Contract", value: <HashLink hash={log.address} type="address" /> },
                      { label: "Tx Hash", value: <HashLink hash={log.txHash} type="tx" /> },
                    ]}
                  />
                ))}
              </div>
              {/* Desktop */}
              <div className="hidden md:block rounded-lg bg-card border border-border overflow-hidden">
                <div className="grid grid-cols-[40px_1fr_120px_1fr_120px] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
                  <span>#</span><span>Contract</span><span>Event</span><span>Topic 0</span><span>Tx Hash</span>
                </div>
                {blockEvents.map((log) => (
                  <div key={log.logIndex} className="row-hover grid grid-cols-[40px_1fr_120px_1fr_120px] gap-3 items-center px-5 py-2.5 border-b border-border last:border-0">
                    <span className="font-mono-data text-xs text-muted-foreground">{log.logIndex}</span>
                    <HashLink hash={log.address} type="address" />
                    <span className="inline-flex px-1.5 py-0.5 rounded-[3px] text-[11px] font-medium bg-[#6E9FFF]/10 text-[#6E9FFF] w-fit">{log.eventName}</span>
                    <span className="font-mono-data text-xs text-muted-foreground truncate">{log.topics[0]?.slice(0, 22)}...</span>
                    <HashLink hash={log.txHash} type="tx" />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-lg bg-card border border-border px-5 py-8 text-center text-sm text-muted-foreground">No event logs in this block</div>
          )}
        </div>
      )}

      {/* State Changes Tab */}
      {tab === "state" && (
        <div className="animate-fadeIn">
          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {stateChanges.map((sc, i) => (
              <MobileCard
                key={i}
                rows={[
                  { label: "Address", value: <HashLink hash={sc.address} type="address" /> },
                  { label: "Slot", value: <span className="font-mono-data text-xs text-[#6E9FFF]">{sc.slot}</span> },
                  { label: "New Value", value: <span className="font-mono-data text-[11px] truncate">{sc.next.slice(0, 18)}...</span> },
                ]}
              />
            ))}
          </div>
          {/* Desktop */}
          <div className="hidden md:block rounded-lg bg-card border border-border overflow-hidden">
            <div className="grid grid-cols-[1fr_60px_1fr_1fr] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
              <span>Address</span><span>Slot</span><span>Previous Value</span><span>New Value</span>
            </div>
            {stateChanges.map((sc, i) => (
              <div key={i} className="row-hover grid grid-cols-[1fr_60px_1fr_1fr] gap-3 items-center px-5 py-2.5 border-b border-border last:border-0">
                <HashLink hash={sc.address} type="address" />
                <span className="font-mono-data text-xs text-[#6E9FFF]">{sc.slot}</span>
                <span className="font-mono-data text-[11px] text-muted-foreground truncate">{sc.prev.slice(0, 22)}...</span>
                <span className="font-mono-data text-[11px] text-foreground truncate">{sc.next.slice(0, 22)}...</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
