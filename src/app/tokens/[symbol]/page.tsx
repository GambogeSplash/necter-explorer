"use client";

import { use, useState, useMemo } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, Users, BarChart3, Info } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { HashLink } from "@/components/hash-link";
import { Pagination } from "@/components/pagination";
import { DateRangePicker } from "@/components/date-range-picker";
import { TimeAgo } from "@/components/time-ago";
import { getTokenLogo } from "@/lib/token-logos";
import { erc20Tokens } from "@/lib/mock-data";

const CHART_TOOLTIP = {
  backgroundColor: "#131315",
  border: "1px solid rgba(255,245,230,0.07)",
  borderRadius: 8,
  fontSize: 12,
  color: "#F9F9F6",
};

// Deterministic seeded random from symbol string
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generatePriceHistory(symbol: string, basePrice: number) {
  const seed = symbol.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = seededRandom(seed);
  return Array.from({ length: 30 }, (_, i) => {
    const trend = basePrice * 0.8 + (i / 29) * basePrice * 0.2;
    const noise = (rand() - 0.5) * basePrice * 0.08;
    return {
      name: `Day ${i + 1}`,
      value: parseFloat((trend + noise).toFixed(4)),
    };
  });
}

const ANCHOR = new Date("2026-04-05T10:00:00.000Z").getTime();
const hour = 3600_000;
const day = 86400_000;

function mockHolders(symbol: string) {
  const seed = symbol.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = seededRandom(seed + 100);
  return Array.from({ length: 5 }, (_, i) => ({
    address: `0x${(0x4a00 + Math.floor(rand() * 0xffff)).toString(16).padStart(4, "0")}B8c9D0e1F2a3B4c5D6e7F8a9B0c1D2e3`,
    balance: Math.floor(rand() * 500_000 + 10_000).toLocaleString(),
    percentage: (25 - i * 5 + rand() * 2).toFixed(2),
  }));
}

function mockTransfers(symbol: string) {
  const seed = symbol.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = seededRandom(seed + 200);
  return Array.from({ length: 5 }, (_, i) => ({
    hash: `0x${(0x9a00 + Math.floor(rand() * 0xffff)).toString(16).padStart(8, "0")}c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8`,
    from: `0x${(0x3300 + Math.floor(rand() * 0xffff)).toString(16).padStart(4, "0")}A7b8C9d0E1f2A3b4C5d6E7f8A9b0C1d2`,
    to: `0x${(0x5500 + Math.floor(rand() * 0xffff)).toString(16).padStart(4, "0")}E1f2A3b4C5d6E7f8A9b0C1d2E3f4A5b6`,
    value: `${(rand() * 1000).toFixed(2)} ${symbol}`,
    timestamp: new Date(ANCHOR - i * day - Math.floor(rand() * hour * 4)).toISOString(),
  }));
}

export default function TokenDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = use(params);
  const token = erc20Tokens.find((t) => t.symbol === symbol);

  const [dateRange, setDateRange] = useState("30d");
  const [holdersPage, setHoldersPage] = useState(1);
  const [transfersPage, setTransfersPage] = useState(1);

  const chartData = useMemo(
    () => (token ? generatePriceHistory(token.symbol, parseFloat(token.price.replace(/,/g, ""))) : []),
    [token],
  );

  if (!token) {
    return (
      <div className="max-w-[1480px] mx-auto px-2.5 py-2 space-y-4">
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
          <img src="/brand/3d/logo-3d.png" alt="" className="h-20 w-20 opacity-40" />
          <h2 className="text-lg font-semibold">Token not found</h2>
          <p className="text-sm text-muted-foreground">
            No token with symbol <span className="font-mono-data text-foreground">{symbol}</span> exists on the Necter Network.
          </p>
        </div>
      </div>
    );
  }

  const change = parseFloat(token.change24h);
  const isPositive = change >= 0;
  const priceNum = parseFloat(token.price.replace(/,/g, ""));
  const supplyNum = parseInt(token.totalSupply.replace(/,/g, ""));
  const marketCap = priceNum * supplyNum;
  const chartColor = token.symbol === "NECTA" ? "#FFC933" : "#6E9FFF";
  const holders = mockHolders(token.symbol);
  const transfers = mockTransfers(token.symbol);

  return (
    <div className="max-w-[1480px] mx-auto px-2.5 py-2 space-y-4">
      {/* Breadcrumb */}

      {/* Header */}
      <div className="flex items-center gap-4">
        <img
          src={getTokenLogo(token.symbol)}
          alt={token.symbol}
          className="h-10 w-10 rounded-full shrink-0"
        />
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight">{token.name}</h1>
            <span className="text-sm text-muted-foreground">{token.symbol}</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-lg font-semibold font-mono-data">${token.price}</span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                isPositive ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-[#EB5757]/10 text-[#EB5757]"
              }`}
            >
              {isPositive ? "+" : ""}
              {token.change24h}%
            </span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Price" value={`$${token.price}`} icon={DollarSign} />
        <StatCard
          title="Market Cap"
          value={`$${marketCap >= 1_000_000 ? `${(marketCap / 1_000_000).toFixed(1)}M` : marketCap.toLocaleString()}`}
          icon={BarChart3}
        />
        <StatCard title="Holders" value={token.holders.toLocaleString()} icon={Users} />
        <StatCard title="Volume 24h" value={`$${token.volume24h}`} icon={BarChart3} />
      </div>

      {/* Price Chart */}
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h2 className="text-sm font-medium">{token.symbol} Price</h2>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
        <div className="px-5 py-4">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`grad-${token.symbol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,245,230,0.04)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#777470" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#777470" }}
                axisLine={false}
                tickLine={false}
                domain={["auto", "auto"]}
                tickFormatter={(v: number) => `$${v.toFixed(2)}`}
                width={52}
              />
              <Tooltip
                contentStyle={CHART_TOOLTIP}
                formatter={((v: number) => [`$${v.toFixed(4)}`, "Price"]) as never}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={chartColor}
                strokeWidth={2}
                fill={`url(#grad-${token.symbol})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Token Info */}
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                    <h2 className="text-sm font-medium">Token Info</h2>
        </div>
        {[
          ["Name", token.name],
          ["Symbol", token.symbol],
          ["Decimals", token.decimals.toString()],
          ["Total Supply", token.totalSupply],
        ].map(([label, val]) => (
          <div key={label} className="flex items-center justify-between px-5 py-2.5 border-b border-border last:border-0">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-mono-data">{val}</span>
          </div>
        ))}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-border last:border-0">
          <span className="text-sm text-muted-foreground">Contract Address</span>
          <HashLink hash={token.address} type="address" />
        </div>
      </div>

      {/* Top Holders & Recent Transfers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Holders */}
        <div className="rounded-lg bg-card border border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-medium">Top Holders</h2>
          </div>
          <div className="hidden md:block">
            <div className="grid grid-cols-[30px_1fr_100px_60px] gap-3 px-5 py-2 border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
              <span>#</span>
              <span>Address</span>
              <span className="text-right">Balance</span>
              <span className="text-right">%</span>
            </div>
            {holders.map((h, i) => (
              <div
                key={h.address}
                className="row-hover grid grid-cols-[30px_1fr_100px_60px] gap-3 items-center px-5 py-2 border-b border-border last:border-0 text-sm"
              >
                <span className="font-mono-data text-xs text-muted-foreground">{i + 1}</span>
                <HashLink hash={h.address} type="address" />
                <span className="text-right font-mono-data">{h.balance}</span>
                <span className="text-right font-mono-data text-xs text-muted-foreground">{h.percentage}%</span>
              </div>
            ))}
          </div>
          <div className="md:hidden p-3 space-y-3">
            {holders.map((h, i) => (
              <div key={h.address} className="rounded-lg border border-border bg-secondary p-3 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Rank</span>
                  <span className="font-mono-data">#{i + 1}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Balance</span>
                  <span className="font-mono-data">{h.balance}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">%</span>
                  <span className="font-mono-data">{h.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-border">
            <Pagination
              currentPage={holdersPage}
              totalPages={1}
              onPageChange={setHoldersPage}
              pageSize={5}
              totalItems={5}
            />
          </div>
        </div>

        {/* Recent Transfers */}
        <div className="rounded-lg bg-card border border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-medium">Recent Transfers</h2>
          </div>
          {/* Desktop transfers */}
          <div className="hidden md:block">
            {transfers.map((tx) => (
              <div
                key={tx.hash}
                className="row-hover flex items-center justify-between px-5 py-2.5 border-b border-border last:border-0"
              >
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
          </div>
          {/* Mobile transfers */}
          <div className="md:hidden p-3 space-y-3">
            {transfers.map((tx) => (
              <div key={tx.hash} className="rounded-lg border border-border bg-secondary p-3 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Tx</span>
                  <HashLink hash={tx.hash} type="tx" />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">To</span>
                  <HashLink hash={tx.to} type="address" />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Value</span>
                  <span className="font-mono-data">{tx.value}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Time</span>
                  <TimeAgo timestamp={tx.timestamp} />
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-border">
            <Pagination
              currentPage={transfersPage}
              totalPages={1}
              onPageChange={setTransfersPage}
              pageSize={5}
              totalItems={5}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
