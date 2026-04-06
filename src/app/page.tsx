"use client";

import {
  Box,
  ChevronLeft,
  ChevronRight,
  Shield,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { StatusBadge } from "@/components/status-badge";
import { TimeAgo } from "@/components/time-ago";
import { getAddressAvatar } from "@/lib/avatar";
import { CountUp } from "@/components/count-up";
import {
  blocks,
  transactions,
  tpsHistory,
  stakingHistory,
  operators,
} from "@/lib/mock-data";
import {
  AreaChart,
  Area,
  XAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const mempoolData = [
  { name: "Token transfer", value: 847, color: "#FFC933" },
  { name: "Contract call", value: 1204, color: "#22C55E" },
  { name: "Job post", value: 412, color: "#9985FF" },
  { name: "Attestation", value: 282, color: "#6E9FFF" },
];
const mempoolTotal = mempoolData.reduce((s, d) => s + d.value, 0);

export default function OverviewPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (d: "left" | "right") =>
    scrollRef.current?.scrollBy({ left: d === "left" ? -200 : 200, behavior: "smooth" });

  const [chartTab, setChartTab] = useState<"txs" | "blocks">("txs");
  const [txTick, setTxTick] = useState(0);
  useEffect(() => { const i = setInterval(() => setTxTick(p => p + 1), 3000); return () => clearInterval(i); }, []);
  const liveTxCount = 5268 + txTick * 3;

  // Simulate new blocks arriving
  const [newBlockCount, setNewBlockCount] = useState(0);
  const [displayBlocks, setDisplayBlocks] = useState(blocks.slice(0, 12));
  useEffect(() => {
    const i = setInterval(() => setNewBlockCount(p => p + 1), 6000);
    return () => clearInterval(i);
  }, []);

  const handleUpdateBlocks = () => {
    // Simulate refreshing block list
    const updated = blocks.slice(0, 12).map((b, i) => ({
      ...b,
      height: b.height + newBlockCount - i,
    }));
    setDisplayBlocks(updated);
    setNewBlockCount(0);
  };

  return (
    <div className="px-2.5 py-4">

      {/* ═══ RECENT BLOCKS ═══ */}
      <section className="pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[22px] font-semibold">Recent blocks</h2>
          <Link href="/blocks" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 underline underline-offset-4 decoration-border hover:decoration-foreground">
            View all blocks <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="relative group/scroll">
          <button onClick={() => scroll("left")} className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-card border border-border items-center justify-center text-muted-foreground hover:text-foreground transition hidden md:flex opacity-0 group-hover/scroll:opacity-100">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div ref={scrollRef} className="flex gap-2.5 overflow-x-auto no-scrollbar">
            {/* New blocks notification — dashed border like Hiro */}
            {newBlockCount > 0 && (
              <button
                onClick={handleUpdateBlocks}
                className="shrink-0 w-[180px] rounded-xl px-4 py-4 border-2 border-dashed border-primary/30 text-center transition-all hover:bg-primary/5 active:scale-[0.97] flex flex-col items-center justify-center gap-1"
              >
                <span className="text-[12px] text-muted-foreground leading-snug">New blocks have<br />been mined.</span>
                <span className="text-[12px] text-primary font-medium flex items-center gap-1">
                  Update <RefreshCw className="h-3 w-3" />
                </span>
              </button>
            )}
            {displayBlocks.map((block, i) => (
              <Link key={block.height} href={`/blocks/${block.height}`}
                className={`shrink-0 w-[180px] rounded-xl px-4 py-3.5 transition-all duration-200 active:scale-[0.97] ${
                  i === 0
                    ? "bg-card border-2 border-primary/40 hover:-translate-y-0.5"
                    : "bg-card border border-border hover:border-muted-foreground/20 hover:-translate-y-0.5"
                }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex h-2 w-2 rounded-full ${i === 0 ? "bg-primary" : "bg-muted-foreground/40"}`} />
                    <span className={`font-mono-data text-[14px] font-semibold ${i === 0 ? "text-primary" : ""}`}>#{block.height.toLocaleString()}</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                </div>
                <p className="text-[11px] text-muted-foreground mb-2">
                  <TimeAgo timestamp={block.timestamp} />
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Box className="h-3 w-3" />
                  <span className="font-mono-data">{block.txCount} transactions</span>
                </div>
              </Link>
            ))}
          </div>
          <button onClick={() => scroll("right")} className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-card border border-border items-center justify-center text-muted-foreground hover:text-foreground transition hidden md:flex opacity-0 group-hover/scroll:opacity-100">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>

      {/* ═══ STAKING + NETWORK OVERVIEW (2-col like Hiro) ═══ */}
      <section className="py-5 border-t border-border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Staking */}
          <div>
            <h2 className="text-[22px] font-semibold mb-4">Staking</h2>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] text-muted-foreground">Current cycle</span>
                <span className="text-[13px] text-muted-foreground flex items-center gap-1.5">
                  <span className="inline-flex h-2 w-2 rounded-full bg-[#22C55E]" /> Ends in ~10 days
                </span>
              </div>
              <p className="text-[40px] font-semibold font-mono-data tracking-tight leading-none mb-2">
                <CountUp value={132} duration={800} />
              </p>
              <p className="text-[12px] text-muted-foreground mb-4">
                ≈ 608.4M NECTA / <span className="text-foreground font-medium">$132.5M</span> staked
              </p>
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Started</span><span>Ends</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "67%" }} />
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>~02 Apr</span><span>~15 Apr</span>
                </div>
              </div>
              <div className="pt-3 border-t border-border space-y-2">
                {operators.slice(0, 3).map(op => (
                  <Link key={op.operatorId} href={`/depin/operator/${op.operatorId}`} className="flex items-center justify-between text-[11px] py-0.5 rounded px-1 -mx-1 hover:bg-secondary transition-colors">
                    <div className="flex items-center gap-1.5">
                      <img src={getAddressAvatar(op.address)} alt="" className="h-3.5 w-3.5 rounded-sm" />
                      <span className="font-mono-data text-muted-foreground">{op.operatorId}</span>
                    </div>
                    <span className="font-mono-data">{parseInt(op.stake).toLocaleString()}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Network Overview — tabbed chart */}
          <div>
            <h2 className="text-[22px] font-semibold mb-4">Network Overview</h2>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-border">
                <button
                  onClick={() => setChartTab("txs")}
                  className={`flex-1 px-4 py-3 text-left transition-colors ${chartTab === "txs" ? "bg-card" : "bg-transparent hover:bg-secondary/50"}`}
                >
                  <span className={`text-[12px] ${chartTab === "txs" ? "text-foreground font-medium" : "text-muted-foreground"}`}>Transactions</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className={`text-[20px] font-semibold font-mono-data ${chartTab === "txs" ? "text-foreground" : "text-muted-foreground"}`}>{liveTxCount.toLocaleString()}</span>
                    <span className="text-[11px] text-muted-foreground">Last 6hs</span>
                  </div>
                  {chartTab === "txs" && <div className="h-[2px] bg-primary rounded-full mt-2 -mb-[1px]" />}
                </button>
                <button
                  onClick={() => setChartTab("blocks")}
                  className={`flex-1 px-4 py-3 text-left transition-colors ${chartTab === "blocks" ? "bg-card" : "bg-transparent hover:bg-secondary/50"}`}
                >
                  <span className={`text-[12px] ${chartTab === "blocks" ? "text-foreground font-medium" : "text-muted-foreground"}`}>Blocks mined</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className={`text-[20px] font-semibold font-mono-data ${chartTab === "blocks" ? "text-foreground" : "text-muted-foreground"}`}>2,744</span>
                    <span className="text-[11px] text-muted-foreground">Last 6hs</span>
                  </div>
                  {chartTab === "blocks" && <div className="h-[2px] bg-primary rounded-full mt-2 -mb-[1px]" />}
                </button>
              </div>
              {/* Chart */}
              <div className="p-5">
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={chartTab === "txs" ? tpsHistory : stakingHistory}>
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartTab === "txs" ? "#FFC933" : "#22C55E"} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={chartTab === "txs" ? "#FFC933" : "#22C55E"} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: "#777470" }} axisLine={false} tickLine={false} interval={3} />
                    <Area type="linear" dataKey="value" stroke={chartTab === "txs" ? "#FFC933" : "#22C55E"} fill="url(#chartGrad)" strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ LATEST TRANSACTIONS + MEMPOOL (equal width) ═══ */}
      <section className="py-5 border-t border-border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Latest Transactions */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[22px] font-semibold">Latest transactions</h2>
              <Link href="/transactions" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                View all transactions <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              {/* Desktop */}
              <div className="hidden md:grid grid-cols-[1fr_100px_100px_80px_60px] gap-2 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground border-b border-border">
                <span>Hash</span><span>From</span><span>Type</span><span className="text-right">Value</span><span className="text-right">Age</span>
              </div>
              {transactions.slice(0, 8).map((tx) => (
                <Link key={tx.hash} href={`/tx/${tx.hash}`} className="row-hover-gold hidden md:grid grid-cols-[1fr_100px_100px_80px_60px] gap-2 items-center px-4 py-[9px] mx-1">
                  <span className="font-mono-data text-[12px] truncate">{tx.hash.slice(0, 12)}...{tx.hash.slice(-4)}</span>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <img src={getAddressAvatar(tx.from)} alt="" className="h-3 w-3 rounded-sm" />
                    <span className="font-mono-data">{tx.from.slice(0, 6)}...</span>
                  </div>
                  <StatusBadge status={tx.type.replace("_", " ")} />
                  <span className="text-right font-mono-data text-[12px]">{parseFloat(tx.value).toFixed(1)}</span>
                  <span className="text-right text-[10px] text-muted-foreground"><TimeAgo timestamp={tx.timestamp} /></span>
                </Link>
              ))}
              {/* Mobile */}
              {transactions.slice(0, 6).map((tx) => (
                <Link key={`m-${tx.hash}`} href={`/tx/${tx.hash}`} className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono-data text-[12px]">{tx.hash.slice(0, 10)}...{tx.hash.slice(-4)}</span>
                      <StatusBadge status={tx.type.replace("_", " ")} />
                    </div>
                    <p className="text-[10px] text-muted-foreground">{tx.from.slice(0, 8)}... → {tx.to.slice(0, 8)}...</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[12px] font-mono-data font-semibold">{parseFloat(tx.value).toFixed(1)}</p>
                    <p className="text-[10px] text-muted-foreground"><TimeAgo timestamp={tx.timestamp} /></p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Mempool */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[22px] font-semibold">Mempool</h2>
              <span className="text-[12px] text-muted-foreground font-mono-data">{mempoolTotal.toLocaleString()} pending</span>
            </div>
            <div className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center gap-6 mb-4">
                <div className="relative w-[120px] h-[120px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={mempoolData} cx="50%" cy="50%" innerRadius={38} outerRadius={56} dataKey="value" paddingAngle={2} stroke="none">
                        {mempoolData.map((d, i) => (<Cell key={i} fill={d.color} />))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[16px] font-semibold font-mono-data">{mempoolTotal.toLocaleString()}</span>
                    <span className="text-[9px] text-muted-foreground">pending</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2.5">
                  {mempoolData.map(d => (
                    <div key={d.name} className="flex items-center justify-between text-[12px]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-muted-foreground">{d.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(d.value / mempoolTotal) * 100}%`, backgroundColor: d.color }} />
                        </div>
                        <span className="font-mono-data text-[11px] w-10 text-right">{d.value.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Estimated fees inline */}
              <div className="pt-4 border-t border-border">
                <p className="text-[11px] text-muted-foreground mb-2">Estimated transaction fees</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { tier: "Low", necta: "0.0005", speed: "~30s" },
                    { tier: "Standard", necta: "0.001", speed: "~6s" },
                    { tier: "High", necta: "0.002", speed: "~2s" },
                  ].map(f => (
                    <div key={f.tier} className="rounded-md bg-muted p-2">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] text-muted-foreground">{f.tier}</span>
                        <span className="text-[9px] text-muted-foreground">{f.speed}</span>
                      </div>
                      <p className="text-[11px] font-semibold font-mono-data">{f.necta} NECTA</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
