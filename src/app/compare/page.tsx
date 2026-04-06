"use client";

import { useState, useMemo } from "react";
import { Scale } from "lucide-react";
import { operators, erc20Tokens } from "@/lib/mock-data";
import { HashLink } from "@/components/hash-link";
import { GaugeChart } from "@/components/gauge-chart";
import { getAddressAvatar } from "@/lib/avatar";
import { PageTitle } from "@/components/page-title";
import { getTokenLogo } from "@/lib/token-logos";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type CompareType = "operators" | "tokens";

/** Simple seeded pseudo-random based on a string seed */
function seededRandom(seed: string, index: number): number {
  let hash = 0;
  const str = seed + index.toString();
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return ((hash & 0x7fffffff) % 1000) / 1000;
}

function generateUptimeData(operatorId: string) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day, i) => ({
    day,
    uptime: 92 + seededRandom(operatorId, i) * 8, // 92-100%
  }));
}

export default function ComparePage() {
  const [compareType, setCompareType] = useState<CompareType>("operators");

  // Operator state
  const [opA, setOpA] = useState(operators[0].operatorId);
  const [opB, setOpB] = useState(operators[1].operatorId);

  // Token state
  const [tokenA, setTokenA] = useState(erc20Tokens[0].symbol);
  const [tokenB, setTokenB] = useState(erc20Tokens[1].symbol);

  const a = operators.find((o) => o.operatorId === opA) ?? operators[0];
  const b = operators.find((o) => o.operatorId === opB) ?? operators[1];

  const tA = erc20Tokens.find((t) => t.symbol === tokenA) ?? erc20Tokens[0];
  const tB = erc20Tokens.find((t) => t.symbol === tokenB) ?? erc20Tokens[1];

  const operatorMetrics = [
    { label: "Stake (NECTA)", a: parseInt(a.stake), b: parseInt(b.stake), higher: true },
    { label: "Uptime (%)", a: a.uptimePercent, b: b.uptimePercent, higher: true },
    { label: "Jobs Completed", a: a.jobsCompleted, b: b.jobsCompleted, higher: true },
    { label: "Delegations", a: a.delegations, b: b.delegations, higher: true },
    { label: "Slashes", a: a.slashes, b: b.slashes, higher: false },
    { label: "Reputation", a: a.reputation, b: b.reputation, higher: true },
  ];

  const tokenMetrics = [
    { label: "Price ($)", a: parseFloat(tA.price.replace(/,/g, "")), b: parseFloat(tB.price.replace(/,/g, "")), higher: true },
    { label: "24h Change (%)", a: parseFloat(tA.change24h), b: parseFloat(tB.change24h), higher: true },
    { label: "Volume ($)", a: parseFloat(tA.volume24h.replace(/,/g, "")), b: parseFloat(tB.volume24h.replace(/,/g, "")), higher: true },
    { label: "Holders", a: tA.holders, b: tB.holders, higher: true },
    { label: "Total Supply", a: parseFloat(tA.totalSupply.replace(/,/g, "")), b: parseFloat(tB.totalSupply.replace(/,/g, "")), higher: true },
  ];

  // Performance chart data for operators
  const chartData = useMemo(() => {
    const dataA = generateUptimeData(a.operatorId);
    const dataB = generateUptimeData(b.operatorId);
    return dataA.map((point, i) => ({
      day: point.day,
      a: parseFloat(point.uptime.toFixed(1)),
      b: parseFloat(dataB[i].uptime.toFixed(1)),
    }));
  }, [a.operatorId, b.operatorId]);

  const metrics = compareType === "operators" ? operatorMetrics : tokenMetrics;
  const labelA = compareType === "operators" ? a.operatorId : tA.symbol;
  const labelB = compareType === "operators" ? b.operatorId : tB.symbol;

  return (
    <div className="px-2.5 py-2 space-y-4">
      <PageTitle title="Compare" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-secondary p-2">
            <Scale className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Compare</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Side-by-side performance comparison</p>
          </div>
        </div>
      </div>

      {/* Entity Type Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["operators", "tokens"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setCompareType(type)}
            className={`px-4 py-2 text-sm font-medium transition-colors relative capitalize ${
              compareType === type
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {type}
            {compareType === type && (
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Selectors */}
      {compareType === "operators" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg bg-card border border-border p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground mb-2">Operator A</p>
            <select
              value={opA}
              onChange={(e) => setOpA(e.target.value)}
              className="w-full bg-secondary border border-border rounded-md h-9 px-3 text-sm text-foreground"
            >
              {operators.map((op) => (
                <option key={op.operatorId} value={op.operatorId}>
                  {op.operatorId} — {op.address.slice(0, 10)}...
                </option>
              ))}
            </select>
          </div>
          <div className="rounded-lg bg-card border border-border p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground mb-2">Operator B</p>
            <select
              value={opB}
              onChange={(e) => setOpB(e.target.value)}
              className="w-full bg-secondary border border-border rounded-md h-9 px-3 text-sm text-foreground"
            >
              {operators.map((op) => (
                <option key={op.operatorId} value={op.operatorId}>
                  {op.operatorId} — {op.address.slice(0, 10)}...
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg bg-card border border-border p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground mb-2">Token A</p>
            <select
              value={tokenA}
              onChange={(e) => setTokenA(e.target.value)}
              className="w-full bg-secondary border border-border rounded-md h-9 px-3 text-sm text-foreground"
            >
              {erc20Tokens.map((t) => (
                <option key={t.symbol} value={t.symbol}>
                  {t.symbol} — {t.name}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2 mt-2">
              <img src={getTokenLogo(tA.symbol)} alt="" className="h-5 w-5 rounded-full" />
              <span className="text-sm text-muted-foreground">{tA.name}</span>
            </div>
          </div>
          <div className="rounded-lg bg-card border border-border p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground mb-2">Token B</p>
            <select
              value={tokenB}
              onChange={(e) => setTokenB(e.target.value)}
              className="w-full bg-secondary border border-border rounded-md h-9 px-3 text-sm text-foreground"
            >
              {erc20Tokens.map((t) => (
                <option key={t.symbol} value={t.symbol}>
                  {t.symbol} — {t.name}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2 mt-2">
              <img src={getTokenLogo(tB.symbol)} alt="" className="h-5 w-5 rounded-full" />
              <span className="text-sm text-muted-foreground">{tB.name}</span>
            </div>
          </div>
        </div>
      )}

      {/* Reputation Gauges (operators only) */}
      {compareType === "operators" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg bg-card border border-border p-5 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-3">
              <img src={getAddressAvatar(a.address)} alt="" className="h-6 w-6 rounded-sm" />
              <span className="text-sm font-medium">{a.operatorId}</span>
            </div>
            <GaugeChart value={a.reputation} label="Reputation" color={a.reputation > 80 ? "#22C55E" : "#FFC933"} />
          </div>
          <div className="rounded-lg bg-card border border-border p-5 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-3">
              <img src={getAddressAvatar(b.address)} alt="" className="h-6 w-6 rounded-sm" />
              <span className="text-sm font-medium">{b.operatorId}</span>
            </div>
            <GaugeChart value={b.reputation} label="Reputation" color={b.reputation > 80 ? "#22C55E" : "#FFC933"} />
          </div>
        </div>
      )}

      {/* Comparison Table — Desktop */}
      <div className="rounded-lg bg-card border border-border overflow-hidden hidden md:block">
        <div className="grid grid-cols-[1fr_120px_120px_80px] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
          <span>Metric</span>
          <span className="text-right">{labelA}</span>
          <span className="text-right">{labelB}</span>
          <span className="text-center">Winner</span>
        </div>
        {metrics.map((m) => {
          const aWins = m.higher ? m.a > m.b : m.a < m.b;
          const bWins = m.higher ? m.b > m.a : m.b < m.a;
          const tie = m.a === m.b;
          return (
            <div key={m.label} className="grid grid-cols-[1fr_120px_120px_80px] gap-3 px-5 py-3 border-b border-border last:border-0 items-center text-sm">
              <span className="text-muted-foreground">{m.label}</span>
              <span className={`text-right font-mono-data ${aWins ? "text-[#22C55E] font-medium" : ""}`}>
                {typeof m.a === "number" && m.a % 1 !== 0 ? m.a.toFixed(2) : m.a.toLocaleString()}
              </span>
              <span className={`text-right font-mono-data ${bWins ? "text-[#22C55E] font-medium" : ""}`}>
                {typeof m.b === "number" && m.b % 1 !== 0 ? m.b.toFixed(2) : m.b.toLocaleString()}
              </span>
              <span className="text-center">
                {tie ? (
                  <span className="text-xs text-muted-foreground">Tie</span>
                ) : aWins ? (
                  <span className="text-xs font-medium text-[#22C55E]">A</span>
                ) : (
                  <span className="text-xs font-medium text-[#6E9FFF]">B</span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {/* Comparison Table — Mobile cards */}
      <div className="md:hidden space-y-3">
        {metrics.map((m) => {
          const aWins = m.higher ? m.a > m.b : m.a < m.b;
          const bWins = m.higher ? m.b > m.a : m.b < m.a;
          const tie = m.a === m.b;
          return (
            <div key={m.label} className="rounded-lg border border-border bg-card p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{m.label}</span>
                <span className="text-xs font-medium">
                  {tie ? (
                    <span className="text-muted-foreground">Tie</span>
                  ) : aWins ? (
                    <span className="text-[#22C55E]">A wins</span>
                  ) : (
                    <span className="text-[#6E9FFF]">B wins</span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={`font-mono-data ${aWins ? "text-[#22C55E] font-medium" : ""}`}>
                  {labelA}: {typeof m.a === "number" && m.a % 1 !== 0 ? m.a.toFixed(2) : m.a.toLocaleString()}
                </span>
                <span className={`font-mono-data ${bWins ? "text-[#22C55E] font-medium" : ""}`}>
                  {labelB}: {typeof m.b === "number" && m.b % 1 !== 0 ? m.b.toFixed(2) : m.b.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Over Time (operators only) */}
      {compareType === "operators" && (
        <div className="rounded-lg bg-card border border-border p-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">Performance Over Time</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Uptime percentage over the last 7 days</p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FFC933]" />
              <span className="text-xs text-muted-foreground">{a.operatorId}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#6E9FFF]" />
              <span className="text-xs text-muted-foreground">{b.operatorId}</span>
            </div>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[90, 100]}
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${value}%`, ""]}
                  labelStyle={{ color: "var(--color-muted-foreground)", fontSize: "11px" }}
                />
                <Line
                  type="monotone"
                  dataKey="a"
                  name={a.operatorId}
                  stroke="#FFC933"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#FFC933" }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="b"
                  name={b.operatorId}
                  stroke="#6E9FFF"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#6E9FFF" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Address Details (operators only) */}
      {compareType === "operators" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg bg-card border border-border p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground mb-2">Address</p>
            <HashLink hash={a.address} type="address" />
            <p className="text-xs text-muted-foreground mt-1">Status: <span className={`font-medium ${a.status === "active" ? "text-[#22C55E]" : a.status === "slashed" ? "text-[#EB5757]" : "text-muted-foreground"}`}>{a.status}</span></p>
          </div>
          <div className="rounded-lg bg-card border border-border p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground mb-2">Address</p>
            <HashLink hash={b.address} type="address" />
            <p className="text-xs text-muted-foreground mt-1">Status: <span className={`font-medium ${b.status === "active" ? "text-[#22C55E]" : b.status === "slashed" ? "text-[#EB5757]" : "text-muted-foreground"}`}>{b.status}</span></p>
          </div>
        </div>
      )}
    </div>
  );
}
