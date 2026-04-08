"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Coins, TrendingUp, DollarSign, CircleDot } from "lucide-react";
import { SortableHeader } from "@/components/sortable-header";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { StatCard } from "@/components/stat-card";
import { HashLink } from "@/components/hash-link";
import { TimeAgo } from "@/components/time-ago";
import { Pagination } from "@/components/pagination";
import { MobileCard } from "@/components/mobile-card";
import { DateRangePicker } from "@/components/date-range-picker";
import { PageTitle } from "@/components/page-title";
import { getTokenLogo } from "@/lib/token-logos";
import {
  networkStats,
  tokenHolders,
  transactions,
  priceHistory,
  erc20Tokens,
} from "@/lib/mock-data";

const CHART_TOOLTIP = {
  backgroundColor: "#131315",
  border: "1px solid rgba(255,245,230,0.07)",
  borderRadius: 8,
  fontSize: 12,
  color: "#F9F9F6",
};

const supplyBreakdown = [
  { label: "Circulating", amount: "67.4M", pct: 53.9, color: "#FFC933" },
  { label: "Staked", amount: "45.2M", pct: 36.2, color: "#22C55E" },
  { label: "Treasury", amount: "12.5M", pct: 10.0, color: "#6E9FFF" },
  { label: "Burned", amount: "2.0M", pct: 1.6, color: "#EB5757" },
];

const PIE_COLORS = ["#FFC933", "#6E9FFF", "#22C55E", "#EB5757", "#777470", "#9b8b5b"];

type Tab = "registry" | "necta";
type SortKey = "name" | "price" | "change24h" | "volume24h" | "holders";

export default function TokensPage() {
  const router = useRouter();
  const transfers = transactions.filter((tx) => tx.type === "transfer");
  const [tab, setTab] = useState<Tab>("registry");
  const [dateRange, setDateRange] = useState("30d");
  const [holdersPage, setHoldersPage] = useState(1);
  const [transfersPage, setTransfersPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const holdersPerPage = 5;
  const transfersPerPage = 5;

  const handleSort = (key: string) => {
    const k = key as SortKey;
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("desc");
    }
  };

  const sortedTokens = useMemo(() => {
    let data = [...erc20Tokens];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (t) => t.name.toLowerCase().includes(q) || t.symbol.toLowerCase().includes(q),
      );
    }
    if (sortKey) {
      data.sort((a, b) => {
        const av =
          sortKey === "name"
            ? a.name
            : sortKey === "price"
              ? parseFloat(a.price.replace(/,/g, ""))
              : sortKey === "change24h"
                ? parseFloat(a.change24h)
                : sortKey === "volume24h"
                  ? parseFloat(a.volume24h.replace(/,/g, ""))
                  : a.holders;
        const bv =
          sortKey === "name"
            ? b.name
            : sortKey === "price"
              ? parseFloat(b.price.replace(/,/g, ""))
              : sortKey === "change24h"
                ? parseFloat(b.change24h)
                : sortKey === "volume24h"
                  ? parseFloat(b.volume24h.replace(/,/g, ""))
                  : b.holders;
        const cmp = typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return data;
  }, [search, sortKey, sortDir]);

  const pagedHolders = tokenHolders.slice((holdersPage - 1) * holdersPerPage, holdersPage * holdersPerPage);
  const pagedTransfers = transfers.slice((transfersPage - 1) * transfersPerPage, transfersPage * transfersPerPage);

  const chartData = useMemo(() => priceHistory.map((p, i) => ({ name: `Day ${i + 1}`, value: p.value })), []);

  const pieData = useMemo(() => {
    const top5 = tokenHolders.slice(0, 5).map((h) => ({ name: `${h.address.slice(0, 8)}...`, value: parseInt(h.balance) }));
    const otherTotal = tokenHolders.slice(5).reduce((s, h) => s + parseInt(h.balance), 0);
    if (otherTotal > 0) top5.push({ name: "Other", value: otherTotal });
    return top5;
  }, []);

  return (
    <div className="max-w-[1480px] mx-auto px-2.5 py-2 space-y-4">
      <PageTitle title="Tokens" />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Tokens</h1>
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-60 animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
          </span>
          <span className="font-mono-data">${networkStats.nectaPrice}</span>
          <span>NECTA · live</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Tokens" value={erc20Tokens.length.toString()} icon={Coins} />
        <StatCard title="NECTA Price" value={`$${networkStats.nectaPrice}`} change="+3.2%" trend="up" icon={DollarSign} />
        <StatCard title="Market Cap" value={`$${networkStats.marketCap}`} change="+5.1%" trend="up" icon={TrendingUp} />
        <StatCard title="Total Holders" value="126K" change="+4.2%" trend="up" icon={CircleDot} />
      </div>

      <div className="n-tabbar">
        <button onClick={() => setTab("registry")} className={`n-tabbar-btn ${tab === "registry" ? "n-tabbar-btn--active" : ""}`}>
          All Tokens ({erc20Tokens.length})
        </button>
        <button onClick={() => setTab("necta")} className={`n-tabbar-btn ${tab === "necta" ? "n-tabbar-btn--active" : ""}`}>
          NECTA Details
        </button>
      </div>

      {tab === "registry" && (
        <div className="animate-fadeIn space-y-4">
          <div className="rounded-lg bg-card border border-border overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-b border-border">
              <h2 className="text-sm font-medium">Token Registry</h2>
              <input
                type="text"
                placeholder="Search by name or symbol..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 px-3 py-1.5 rounded-md bg-secondary border border-border text-[12px] placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            {sortedTokens.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-sm text-muted-foreground">No tokens match your search.</p>
                <button
                  onClick={() => setSearch("")}
                  className="mt-2 text-[11px] text-primary hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-3 px-5 py-2.5 border-b border-border text-[10px] text-muted-foreground uppercase tracking-[0.06em]">
                    <SortableHeader label="Token" sortKey="name" currentSort={sortKey} direction={sortDir} onSort={handleSort} />
                    <div className="text-right">
                      <SortableHeader label="Price" sortKey="price" currentSort={sortKey} direction={sortDir} onSort={handleSort} />
                    </div>
                    <div className="text-right">
                      <SortableHeader label="24h" sortKey="change24h" currentSort={sortKey} direction={sortDir} onSort={handleSort} />
                    </div>
                    <div className="text-right">
                      <SortableHeader label="Volume 24h" sortKey="volume24h" currentSort={sortKey} direction={sortDir} onSort={handleSort} />
                    </div>
                    <div className="text-right">
                      <SortableHeader label="Holders" sortKey="holders" currentSort={sortKey} direction={sortDir} onSort={handleSort} />
                    </div>
                    <span className="text-right">Total Supply</span>
                  </div>
                  {sortedTokens.map((token) => {
                    const change = parseFloat(token.change24h);
                    return (
                      <Link key={token.symbol} href={`/tokens/${token.symbol}`} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-3 items-center px-5 py-3 border-b border-border last:border-0 text-sm hover:bg-secondary/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <img src={getTokenLogo(token.symbol)} alt={token.symbol} className="h-7 w-7 rounded-full shrink-0" />
                          <div>
                            <span className="font-medium">{token.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">{token.symbol}</span>
                          </div>
                        </div>
                        <span className="text-right font-mono-data tabular-nums">${token.price}</span>
                        <span className={`text-right font-mono-data tabular-nums ${change >= 0 ? "text-[#22C55E]" : "text-[#EB5757]"}`}>{change >= 0 ? "+" : ""}{token.change24h}%</span>
                        <span className="text-right font-mono-data text-muted-foreground tabular-nums">${token.volume24h}</span>
                        <span className="text-right font-mono-data text-muted-foreground tabular-nums">{token.holders.toLocaleString()}</span>
                        <span className="text-right font-mono-data text-muted-foreground tabular-nums">{token.totalSupply}</span>
                      </Link>
                    );
                  })}
                </div>
                <div className="md:hidden p-3 space-y-3">
                  {sortedTokens.map((token) => {
                    const change = parseFloat(token.change24h);
                    return (
                      <MobileCard key={token.symbol} onClick={() => router.push(`/tokens/${token.symbol}`)} rows={[
                        { label: "Token", value: <div className="flex items-center gap-2"><img src={getTokenLogo(token.symbol)} alt="" className="h-5 w-5 rounded-full" /><span className="font-medium">{token.name}</span></div> },
                        { label: "Price", value: <span className="font-mono-data">${token.price}</span> },
                        { label: "24h", value: <span className={`font-mono-data ${change >= 0 ? "text-[#22C55E]" : "text-[#EB5757]"}`}>{change >= 0 ? "+" : ""}{token.change24h}%</span> },
                        { label: "Holders", value: <span className="font-mono-data">{token.holders.toLocaleString()}</span> },
                      ]} />
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {tab === "necta" && (
        <div className="animate-fadeIn space-y-4">
          <div className="rounded-lg bg-card border border-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <img src="/brand/logo.svg" alt="NECTA" className="h-5 w-5" />
                <h2 className="text-sm font-medium">NECTA Price</h2>
              </div>
              <DateRangePicker value={dateRange} onChange={setDateRange} />
            </div>
            <div className="px-5 py-4">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FFC933" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#FFC933" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,245,230,0.04)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#777470" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: "#777470" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} tickFormatter={(v: number) => `$${v.toFixed(2)}`} width={52} />
                  <Tooltip contentStyle={CHART_TOOLTIP} formatter={((v: number) => [`$${v.toFixed(4)}`, "Price"]) as never} />
                  <Area type="monotone" dataKey="value" stroke="#FFC933" strokeWidth={2} fill="url(#priceGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-5 pb-4">
              {[["Current Price", "$0.47", ""], ["24h Change", "+3.2%", "text-[#22C55E]"], ["24h High", "$0.49", ""], ["24h Low", "$0.44", ""]].map(([label, val, color]) => (
                <div key={label}>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                  <p className={`text-sm font-semibold font-mono-data ${color}`}>{val}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-card border border-border overflow-hidden">
            <div className="px-5 py-3 border-b border-border"><h2 className="text-sm font-medium">Supply Breakdown</h2></div>
            <div className="px-5 py-4 space-y-3">
              <div className="w-full h-6 rounded-full overflow-hidden flex">
                {supplyBreakdown.map((seg) => (<div key={seg.label} className="h-full bar-fill" style={{ width: `${seg.pct}%`, backgroundColor: seg.color }} />))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {supplyBreakdown.map((seg) => (
                  <div key={seg.label} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                    <div><p className="text-xs font-medium">{seg.label}</p><p className="text-[10px] text-muted-foreground font-mono-data">{seg.amount} ({seg.pct}%)</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-lg bg-card border border-border overflow-hidden">
              <div className="px-5 py-3 border-b border-border"><h2 className="text-sm font-medium">Holder Distribution</h2></div>
              <div className="flex flex-col items-center gap-4 px-5 py-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={2} stroke="none">
                      {pieData.map((_, i) => (<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />))}
                    </Pie>
                    <Tooltip contentStyle={CHART_TOOLTIP} formatter={((v: number) => [v.toLocaleString(), "Balance"]) as never} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-full space-y-1.5">
                  {pieData.map((entry, i) => (
                    <div key={entry.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} /><span className="font-mono-data text-xs">{entry.name}</span></div>
                      <span className="font-mono-data text-xs text-muted-foreground">{entry.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-card border border-border overflow-hidden">
              <div className="px-5 py-3 border-b border-border"><h2 className="text-sm font-medium">Token Info</h2></div>
              {[["Token Name", "NECTA"], ["Network", "Necter Network (L2)"], ["Decimals", "18"], ["Standard", "ERC-20"], ["Utility", "Gas, mining rewards, staking, governance"], ["Emission", "Fixed cap, decreasing schedule"]].map(([label, val]) => (
                <div key={label} className="flex items-center py-2.5 px-5 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground w-36 shrink-0">{label}</span>
                  <span className="text-sm font-mono-data">{val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-lg bg-card border border-border overflow-hidden">
              <div className="px-5 py-3 border-b border-border"><h2 className="text-sm font-medium">Top NECTA Holders</h2></div>
              <div className="hidden md:block">
                <div className="grid grid-cols-[30px_1fr_100px_50px] gap-3 px-5 py-2 border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
                  <span>#</span><span>Address</span><span className="text-right">Balance</span><span className="text-right">%</span>
                </div>
                {pagedHolders.map((h, i) => (
                  <div key={h.address} className="row-hover grid grid-cols-[30px_1fr_100px_50px] gap-3 items-center px-5 py-2 border-b border-border last:border-0 text-sm">
                    <span className="font-mono-data text-xs text-muted-foreground">{(holdersPage - 1) * holdersPerPage + i + 1}</span>
                    <HashLink hash={h.address} type="address" />
                    <span className="text-right font-mono-data">{parseInt(h.balance).toLocaleString()}</span>
                    <span className="text-right font-mono-data text-xs text-muted-foreground">{h.percentage}%</span>
                  </div>
                ))}
              </div>
              <div className="md:hidden p-3 space-y-3">
                {pagedHolders.map((h, i) => (
                  <MobileCard key={h.address} rows={[
                    { label: "Rank", value: <span className="font-mono-data">#{(holdersPage - 1) * holdersPerPage + i + 1}</span> },
                    { label: "Balance", value: <span className="font-mono-data">{parseInt(h.balance).toLocaleString()}</span> },
                    { label: "%", value: <span className="font-mono-data">{h.percentage}%</span> },
                  ]} />
                ))}
              </div>
              <div className="px-5 py-3 border-t border-border">
                <Pagination currentPage={holdersPage} totalPages={Math.ceil(tokenHolders.length / holdersPerPage)} onPageChange={setHoldersPage} pageSize={holdersPerPage} totalItems={tokenHolders.length} />
              </div>
            </div>
            <div className="rounded-lg bg-card border border-border overflow-hidden">
              <div className="px-5 py-3 border-b border-border"><h2 className="text-sm font-medium">Recent Transfers</h2></div>
              {pagedTransfers.map((tx) => (
                <div key={tx.hash} className="row-hover flex items-center justify-between px-5 py-2.5 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <HashLink hash={tx.hash} type="tx" />
                    <span className="text-muted-foreground text-[11px]">{"\u2192"}</span>
                    <HashLink hash={tx.to} type="address" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono-data text-sm">{tx.value}</span>
                    <TimeAgo timestamp={tx.timestamp} />
                  </div>
                </div>
              ))}
              <div className="px-5 py-3 border-t border-border">
                <Pagination currentPage={transfersPage} totalPages={Math.ceil(transfers.length / transfersPerPage)} onPageChange={setTransfersPage} pageSize={transfersPerPage} totalItems={transfers.length} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
