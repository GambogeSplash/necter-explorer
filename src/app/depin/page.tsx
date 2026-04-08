"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Radio, Cpu, Zap, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { HashLink } from "@/components/hash-link";
import { StatusBadge } from "@/components/status-badge";
import { StatCard } from "@/components/stat-card";
import { Pagination } from "@/components/pagination";
import { MobileCard } from "@/components/mobile-card";
import { SortableHeader } from "@/components/sortable-header";
import { devices, operators, deviceLocations } from "@/lib/mock-data";
import { PageTitle } from "@/components/page-title";
import { useMemo, useState, useEffect } from "react";

// ─── Inline seeded random for deterministic visuals ────────────────────────
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── World dot map ─────────────────────────────────────────────────────────
// Inspired by Cloudflare Radar / Helium Explorer dot maps.
// Wide aspect (6:1) so it fills the full-width DePIN card without margins.
const MAP_W = 1400;
const MAP_H = 240;

type Region = {
  name: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  intensity: number;
};
const regions: Region[] = [
  { name: "North America", cx: 230, cy: 75, rx: 110, ry: 50, intensity: 1.0 },
  { name: "North America East", cx: 290, cy: 115, rx: 55, ry: 30, intensity: 0.85 },
  { name: "South America", cx: 360, cy: 175, rx: 42, ry: 50, intensity: 0.55 },
  { name: "Europe", cx: 700, cy: 70, rx: 75, ry: 35, intensity: 1.0 },
  { name: "Africa", cx: 720, cy: 155, rx: 70, ry: 55, intensity: 0.5 },
  { name: "Middle East", cx: 800, cy: 110, rx: 45, ry: 25, intensity: 0.6 },
  { name: "Russia / Central Asia", cx: 920, cy: 55, rx: 145, ry: 28, intensity: 0.7 },
  { name: "South Asia", cx: 960, cy: 125, rx: 55, ry: 28, intensity: 0.75 },
  { name: "East Asia", cx: 1080, cy: 95, rx: 70, ry: 35, intensity: 1.0 },
  { name: "Southeast Asia", cx: 1100, cy: 160, rx: 45, ry: 25, intensity: 0.6 },
  { name: "Oceania", cx: 1200, cy: 200, rx: 70, ry: 32, intensity: 0.55 },
];

type Dot = { x: number; y: number; intensity: number; region: string };

function buildDots(): Dot[] {
  const dots: Dot[] = [];
  const seeded = mulberry32(1337);
  regions.forEach((r) => {
    const area = r.rx * r.ry;
    const count = Math.max(20, Math.floor(area / 18));
    for (let i = 0; i < count; i++) {
      const t = seeded() * Math.PI * 2;
      const u = Math.sqrt(seeded());
      const x = r.cx + Math.cos(t) * u * r.rx + (seeded() - 0.5) * 4;
      const y = r.cy + Math.sin(t) * u * r.ry + (seeded() - 0.5) * 4;
      const dist = Math.hypot((x - r.cx) / r.rx, (y - r.cy) / r.ry);
      const localIntensity = Math.max(0, 1 - dist) * r.intensity;
      dots.push({ x, y, intensity: localIntensity, region: r.name });
    }
  });
  return dots;
}

// Per-region device counts (deterministic, for tooltips)
function regionStats() {
  const stats: Record<string, { devices: number; operators: number; uptime: number }> = {};
  const r = mulberry32(99);
  regions.forEach((reg) => {
    stats[reg.name] = {
      devices: Math.floor(reg.rx * reg.ry * reg.intensity * 0.9 + r() * 60),
      operators: Math.floor(reg.intensity * 25 + r() * 8),
      uptime: 92 + r() * 7,
    };
  });
  return stats;
}
const regionStatsMap = regionStats();

const dots = buildDots();

// Pick the brightest ~12 dots — these get the pulsing animation
const brightDots = [...dots].sort((a, b) => b.intensity - a.intensity).slice(0, 14);
const brightSet = new Set(brightDots);

// ─── Ocean / base layer dots ───────────────────────────────────────────────
// Sparse uniform grid of very dim dots covering the whole map.
// This gives the illusion of "land vs ocean" without needing real continent
// outlines: the bright green dots on top form recognizable cluster shapes.
function buildOceanDots() {
  const out: { x: number; y: number }[] = [];
  const stride = 22;
  for (let y = 25; y < 230; y += stride) {
    for (let x = 100; x < 1300; x += stride) {
      // Skip dots that fall too close to a populated region — those are
      // already covered by the bright dot layer.
      const tooClose = regions.some((r) => {
        const dist = Math.hypot((x - r.cx) / r.rx, (y - r.cy) / r.ry);
        return dist < 1.05;
      });
      if (!tooClose) out.push({ x, y });
    }
  }
  return out;
}
const oceanDots = buildOceanDots();

function dotFill(intensity: number): string {
  if (intensity < 0.15) return "rgba(255,255,255,0.08)";
  if (intensity < 0.45) return "rgba(34,197,94,0.35)";
  if (intensity < 0.75) return "rgba(34,197,94,0.7)";
  return "#22C55E";
}

const PAGE_SIZE = 25;

export default function DePINPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"devices" | "operators">("devices");
  const [devicePage, setDevicePage] = useState(1);
  const [operatorPage, setOperatorPage] = useState(1);
  const [search, setSearch] = useState("");
  type DeviceSortKey = "deviceId" | "attestationCount" | "stakedAmount" | "uptime";
  type OperatorSortKey = "operatorId" | "stake" | "uptimePercent" | "jobsCompleted" | "reputation";
  const [deviceSort, setDeviceSort] = useState<{ key: DeviceSortKey; dir: "asc" | "desc" }>({
    key: "stakedAmount",
    dir: "desc",
  });
  const [operatorSort, setOperatorSort] = useState<{ key: OperatorSortKey; dir: "asc" | "desc" }>({
    key: "stake",
    dir: "desc",
  });

  // ─── Live attestation rate ticker ────────────────────────────────────────
  const [liveRate, setLiveRate] = useState(1247);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const activeRegion = hoveredRegion ?? selectedRegion;

  // Watch list — operators delegators should review before staking
  const watchList = useMemo(
    () =>
      operators
        .filter(
          (o) =>
            o.slashes > 0 ||
            o.uptimePercent < 90 ||
            o.reputation < 70 ||
            o.status === "inactive",
        )
        .sort((a, b) => {
          // Higher severity first: slashes > low uptime > low rep
          const score = (op: typeof a) =>
            op.slashes * 100 + (100 - op.uptimePercent) + (100 - op.reputation);
          return score(b) - score(a);
        })
        .slice(0, 5),
    [],
  );

  useEffect(() => {
    const tick = setInterval(() => {
      setLiveRate((prev) => {
        const drift = Math.floor(Math.random() * 9 - 4);
        return Math.max(1100, Math.min(1400, prev + drift));
      });
    }, 1800);
    return () => clearInterval(tick);
  }, []);

  // ─── Derived stats ────────────────────────────────────────────────────────
  const activeDevices = devices.filter((d) => d.status === "active").length;
  const activeOperators = operators.filter((o) => o.status === "active").length;
  const totalStaked = operators.reduce((sum, o) => sum + parseInt(o.stake), 0);

  // ─── Table filtering ──────────────────────────────────────────────────────
  const filteredDevices = useMemo(() => {
    const base = !search.trim()
      ? devices
      : devices.filter((d) => {
          const q = search.toLowerCase();
          return d.deviceId.toLowerCase().includes(q) || d.owner.toLowerCase().includes(q);
        });
    const sorted = [...base].sort((a, b) => {
      const k = deviceSort.key;
      const av = k === "stakedAmount" ? parseInt(a.stakedAmount) : (a[k] as number | string);
      const bv = k === "stakedAmount" ? parseInt(b.stakedAmount) : (b[k] as number | string);
      const cmp = typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv));
      return deviceSort.dir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [search, deviceSort]);

  const filteredOperators = useMemo(() => {
    const base = !search.trim()
      ? operators
      : operators.filter((o) => {
          const q = search.toLowerCase();
          return o.operatorId.toLowerCase().includes(q) || o.address.toLowerCase().includes(q);
        });
    const sorted = [...base].sort((a, b) => {
      const k = operatorSort.key;
      const av = k === "stake" ? parseInt(a.stake) : (a[k] as number | string);
      const bv = k === "stake" ? parseInt(b.stake) : (b[k] as number | string);
      const cmp = typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv));
      return operatorSort.dir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [search, operatorSort]);

  const toggleDeviceSort = (key: DeviceSortKey) =>
    setDeviceSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" },
    );
  const toggleOperatorSort = (key: OperatorSortKey) =>
    setOperatorSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" },
    );

  const deviceTotalPages = Math.ceil(filteredDevices.length / PAGE_SIZE);
  const operatorTotalPages = Math.ceil(filteredOperators.length / PAGE_SIZE);
  const paginatedDevices = filteredDevices.slice(
    (devicePage - 1) * PAGE_SIZE,
    devicePage * PAGE_SIZE,
  );
  const paginatedOperators = filteredOperators.slice(
    (operatorPage - 1) * PAGE_SIZE,
    operatorPage * PAGE_SIZE,
  );

  return (
    <div className="max-w-[1480px] mx-auto px-2.5 py-2 space-y-4">
      <PageTitle title="DePIN" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">DePIN Network</h1>
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-60 animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
          </span>
          <span className="font-mono-data tabular-nums">{liveRate.toLocaleString()}</span>
          <span>attestations/min</span>
        </div>
      </div>

      {/* Stats — shared StatCard component */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total Devices"
          value={devices.length.toLocaleString()}
          change="+47 this week"
          trend="up"
          icon={Cpu}
        />
        <StatCard
          title="Active Operators"
          value={activeOperators.toString()}
          change="+3"
          trend="up"
          icon={Radio}
        />
        <StatCard
          title="Slashing Events 30d"
          value="11"
          change="-3"
          trend="down"
          icon={AlertTriangle}
        />
        <StatCard
          title="Total Staked"
          value={`${(totalStaked / 1000).toFixed(0)}K`}
          change="+8.2%"
          trend="up"
          icon={Zap}
        />
      </div>

      {/* Global device distribution */}
      <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium">Global Device Distribution</h2>
              <span className="text-[10px] text-muted-foreground hidden sm:inline">— hover or click a region</span>
            </div>
            <span className="text-[11px] text-muted-foreground">{dots.length.toLocaleString()} nodes · 11 regions</span>
          </div>
            {/* SVG dot map */}
            <div className="relative w-full">
              <svg
                viewBox={`100 25 1200 200`}
                className="w-full h-auto block"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <radialGradient id="dotGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
                  </radialGradient>
                </defs>
                {/* Ocean base layer — sparse dim dots */}
                {oceanDots.map((d, i) => (
                  <circle
                    key={`o-${i}`}
                    cx={d.x}
                    cy={d.y}
                    r={1}
                    fill="rgba(255,255,255,0.05)"
                  />
                ))}
                {/* Invisible region hit areas — focusable for keyboard nav */}
                {regions.map((reg) => (
                  <ellipse
                    key={reg.name}
                    cx={reg.cx}
                    cy={reg.cy}
                    rx={reg.rx + 8}
                    ry={reg.ry + 8}
                    fill="transparent"
                    className="cursor-pointer focus:outline-none"
                    tabIndex={0}
                    role="button"
                    aria-label={`${reg.name} region — click to view stats`}
                    onMouseEnter={() => setHoveredRegion(reg.name)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    onFocus={() => setHoveredRegion(reg.name)}
                    onBlur={() => setHoveredRegion(null)}
                    onClick={() =>
                      setSelectedRegion((prev) => (prev === reg.name ? null : reg.name))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedRegion((prev) => (prev === reg.name ? null : reg.name));
                      }
                    }}
                  />
                ))}
                {/* All dots */}
                {dots.map((d, i) => {
                  const isBright = brightSet.has(d);
                  const isActive = activeRegion === d.region;
                  const baseR = 1.3 + d.intensity * 1.8;
                  const r = isActive ? baseR * 1.5 : baseR;
                  return (
                    <g key={i} className="pointer-events-none">
                      {(isBright || isActive) && (
                        <circle
                          cx={d.x}
                          cy={d.y}
                          r={r * 4}
                          fill="url(#dotGlow)"
                          className={isActive ? "" : "animate-pulse"}
                        />
                      )}
                      <circle
                        cx={d.x}
                        cy={d.y}
                        r={r}
                        fill={isActive ? "#FFC933" : dotFill(d.intensity)}
                        className="transition-all"
                      />
                    </g>
                  );
                })}
                {/* Region label on hover */}
                {activeRegion &&
                  (() => {
                    const reg = regions.find((r) => r.name === activeRegion);
                    if (!reg) return null;
                    return (
                      <g pointerEvents="none">
                        <rect
                          x={reg.cx - 75}
                          y={reg.cy - reg.ry - 24}
                          width={150}
                          height={18}
                          rx={3}
                          fill="#0a0a0c"
                          stroke="rgba(255,255,255,0.1)"
                        />
                        <text
                          x={reg.cx}
                          y={reg.cy - reg.ry - 12}
                          textAnchor="middle"
                          fontSize="11"
                          fill="#FFC933"
                          fontFamily="ui-monospace, monospace"
                        >
                          {reg.name.toUpperCase()}
                        </text>
                      </g>
                    );
                  })()}
              </svg>

              {/* Active region info panel — overlays bottom-left */}
              {activeRegion && regionStatsMap[activeRegion] && (
                <div className="absolute bottom-2 left-2 rounded-md border border-border bg-card/95 backdrop-blur px-3 py-2 text-[11px] shadow-lg pointer-events-none">
                  <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground mb-1">
                    {activeRegion}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Devices</span>
                      <span className="font-mono-data tabular-nums text-foreground">
                        {regionStatsMap[activeRegion].devices}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Operators</span>
                      <span className="font-mono-data tabular-nums text-foreground">
                        {regionStatsMap[activeRegion].operators}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Uptime</span>
                      <span className="font-mono-data tabular-nums text-[#22C55E]">
                        {regionStatsMap[activeRegion].uptime.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>Less</span>
                <div className="flex gap-1 items-center">
                  {[0.1, 0.3, 0.55, 0.8, 1.0].map((a, i) => (
                    <span
                      key={i}
                      className="rounded-full"
                      style={{
                        backgroundColor: dotFill(a),
                        width: 4 + i * 1.5,
                        height: 4 + i * 1.5,
                      }}
                    />
                  ))}
                </div>
                <span>More</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" /> Active
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#6E9FFF]" /> Pending
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#EB5757]" /> Slashed
                </span>
              </div>
            </div>
          </div>

      {/* Watch list — concerning operators delegators should know about */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-medium">Watch list</h2>
            <span className="hidden sm:inline text-[11px] text-muted-foreground">
              Review before delegating
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-muted-foreground">
              {watchList.length} flagged · updated 12s ago
            </span>
            {watchList.length >= 2 && (
              <Link
                href={`/compare?a=${watchList[0].operatorId}&b=${watchList[1].operatorId}`}
                className="text-[11px] text-primary hover:underline"
              >
                Compare top 2 →
              </Link>
            )}
          </div>
        </div>
        <div className="hidden md:grid grid-cols-[80px_1fr_120px_120px_120px_1fr] gap-3 px-5 py-2 border-b border-border text-[10px] text-muted-foreground uppercase tracking-[0.06em]">
          <span>Operator</span>
          <span>Address</span>
          <span className="text-right">Stake</span>
          <span className="text-right">Uptime · 7d</span>
          <span className="text-right">Reputation · 7d</span>
          <span>Reason</span>
        </div>
        <div className="divide-y divide-border">
          {watchList.map((op) => {
            // Deterministic 7d trend deltas based on operator id
            const seed = parseInt(op.operatorId.replace("OP-", "")) * 17 + 3;
            const r = mulberry32(seed);
            const uptimeDelta = (r() * 6 - 4).toFixed(1); // -4 to +2
            const repDelta = Math.floor(r() * 12 - 8); // -8 to +4
            const upDown = parseFloat(uptimeDelta) >= 0;
            const repUp = repDelta >= 0;
            return (
              <Link
                key={op.operatorId}
                href={`/depin/operator/${op.operatorId}`}
                className="grid md:grid-cols-[80px_1fr_120px_120px_120px_1fr] grid-cols-[1fr_auto] gap-3 items-center px-5 py-3 text-sm hover:bg-secondary/30 transition-colors"
              >
                <div className="md:contents flex items-center gap-2 min-w-0">
                  <span className="font-mono-data font-medium text-primary">
                    {op.operatorId}
                  </span>
                  <div className="hidden md:block">
                    <HashLink hash={op.address} type="address" />
                  </div>
                  <span className="hidden md:inline text-right font-mono-data tabular-nums">
                    {parseInt(op.stake).toLocaleString()}
                  </span>
                  <div className="hidden md:flex items-center justify-end gap-1.5">
                    <span
                      className={`font-mono-data tabular-nums ${
                        op.uptimePercent < 90 ? "text-[#EB5757]" : "text-muted-foreground"
                      }`}
                    >
                      {op.uptimePercent.toFixed(1)}%
                    </span>
                    <span
                      className={`text-[10px] font-mono-data tabular-nums flex items-center gap-0.5 ${
                        upDown ? "text-[#22C55E]" : "text-[#EB5757]"
                      }`}
                    >
                      {upDown ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                      {Math.abs(parseFloat(uptimeDelta))}
                    </span>
                  </div>
                  <div className="hidden md:flex items-center justify-end gap-1.5">
                    <span
                      className={`font-mono-data ${
                        op.reputation < 70 ? "text-[#EB5757]" : "text-muted-foreground"
                      }`}
                    >
                      {op.reputation}
                    </span>
                    <span
                      className={`text-[10px] font-mono-data tabular-nums flex items-center gap-0.5 ${
                        repUp ? "text-[#22C55E]" : "text-[#EB5757]"
                      }`}
                    >
                      {repUp ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                      {Math.abs(repDelta)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] flex-wrap justify-end md:justify-start">
                  {op.slashes > 0 && (
                    <span className="px-1.5 py-0.5 rounded border border-[#EB5757]/30 bg-[#EB5757]/10 text-[#EB5757] text-[10px]">
                      {op.slashes} slash{op.slashes > 1 ? "es" : ""}
                    </span>
                  )}
                  {op.uptimePercent < 90 && (
                    <span className="px-1.5 py-0.5 rounded border border-[#EB5757]/30 bg-[#EB5757]/10 text-[#EB5757] text-[10px]">
                      Low uptime
                    </span>
                  )}
                  {op.reputation < 70 && (
                    <span className="px-1.5 py-0.5 rounded border border-[#EB5757]/30 bg-[#EB5757]/10 text-[#EB5757] text-[10px]">
                      Low rep
                    </span>
                  )}
                  {op.status === "inactive" && (
                    <span className="px-1.5 py-0.5 rounded border border-border text-muted-foreground text-[10px]">
                      Inactive
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Browse all */}
      <div id="browse" className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 py-3 border-b border-border">
          <h2 className="text-sm font-medium">Browse Network</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="n-tabbar">
              <button
                onClick={() => {
                  setTab("devices");
                  setDevicePage(1);
                }}
                className={`n-tabbar-btn ${tab === "devices" ? "n-tabbar-btn--active" : ""}`}
              >
                Devices ({filteredDevices.length})
              </button>
              <button
                onClick={() => {
                  setTab("operators");
                  setOperatorPage(1);
                }}
                className={`n-tabbar-btn ${tab === "operators" ? "n-tabbar-btn--active" : ""}`}
              >
                Operators ({filteredOperators.length})
              </button>
            </div>
            <input
              type="text"
              placeholder="Search by ID or address..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setDevicePage(1);
                setOperatorPage(1);
              }}
              className="w-full sm:w-64 px-3 py-1.5 rounded-md bg-secondary border border-border text-[12px] placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {tab === "devices" && filteredDevices.length === 0 && (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-muted-foreground">No devices match your search.</p>
            <button
              onClick={() => setSearch("")}
              className="mt-2 text-[11px] text-primary hover:underline"
            >
              Clear search
            </button>
          </div>
        )}

        {tab === "devices" && filteredDevices.length > 0 && (
          <div>
            <div className="hidden md:block">
              <div className="grid grid-cols-[80px_1fr_1fr_80px_80px_80px_120px] gap-3 px-5 py-2.5 border-b border-border text-[10px] text-muted-foreground uppercase tracking-[0.06em]">
                <SortableHeader label="ID" sortKey="deviceId" currentSort={deviceSort.key} direction={deviceSort.dir} onSort={(k) => toggleDeviceSort(k as DeviceSortKey)} />
                <span>Fingerprint</span>
                <span>Owner</span>
                <div className="text-right">
                  <SortableHeader label="Attest." sortKey="attestationCount" currentSort={deviceSort.key} direction={deviceSort.dir} onSort={(k) => toggleDeviceSort(k as DeviceSortKey)} />
                </div>
                <span>Status</span>
                <div className="text-right">
                  <SortableHeader label="Staked" sortKey="stakedAmount" currentSort={deviceSort.key} direction={deviceSort.dir} onSort={(k) => toggleDeviceSort(k as DeviceSortKey)} />
                </div>
                <SortableHeader label="Uptime" sortKey="uptime" currentSort={deviceSort.key} direction={deviceSort.dir} onSort={(k) => toggleDeviceSort(k as DeviceSortKey)} />
              </div>
              {paginatedDevices.map((d) => (
                <div
                  key={d.deviceId}
                  className="grid grid-cols-[80px_1fr_1fr_80px_80px_80px_120px] gap-3 items-center px-5 py-2.5 border-b border-border last:border-0 text-sm hover:bg-secondary/30 transition-colors"
                >
                  <Link
                    href={`/depin/device/${d.deviceId}`}
                    className="font-mono-data font-medium text-primary hover:underline"
                  >
                    {d.deviceId}
                  </Link>
                  <HashLink hash={d.fingerprint} type="tx" />
                  <HashLink hash={d.owner} type="address" />
                  <span className="text-right font-mono-data text-muted-foreground tabular-nums">
                    {d.attestationCount}
                  </span>
                  <StatusBadge status={d.status} />
                  <span className="text-right font-mono-data tabular-nums">
                    {parseInt(d.stakedAmount).toLocaleString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          d.uptime > 95
                            ? "bg-[#22C55E]"
                            : d.uptime > 80
                              ? "bg-[#EB5757]"
                              : "bg-[#EB5757]"
                        }`}
                        style={{ width: `${d.uptime}%` }}
                      />
                    </div>
                    <span className="font-mono-data text-[10px] text-muted-foreground tabular-nums">
                      {d.uptime.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="md:hidden p-3 space-y-3">
              {paginatedDevices.map((d) => (
                <MobileCard
                  key={d.deviceId}
                  onClick={() => router.push(`/depin/device/${d.deviceId}`)}
                  rows={[
                    {
                      label: "Device ID",
                      value: <span className="font-mono-data text-primary">{d.deviceId}</span>,
                    },
                    { label: "Status", value: <StatusBadge status={d.status} /> },
                    {
                      label: "Staked",
                      value: (
                        <span className="font-mono-data">
                          {parseInt(d.stakedAmount).toLocaleString()}
                        </span>
                      ),
                    },
                    {
                      label: "Uptime",
                      value: <span className="font-mono-data">{d.uptime.toFixed(1)}%</span>,
                    },
                  ]}
                />
              ))}
            </div>
            <div className="px-5 py-3 border-t border-border">
              <Pagination
                currentPage={devicePage}
                totalPages={deviceTotalPages}
                onPageChange={setDevicePage}
                pageSize={PAGE_SIZE}
                totalItems={filteredDevices.length}
              />
            </div>
          </div>
        )}

        {tab === "operators" && filteredOperators.length === 0 && (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-muted-foreground">No operators match your search.</p>
            <button
              onClick={() => setSearch("")}
              className="mt-2 text-[11px] text-primary hover:underline"
            >
              Clear search
            </button>
          </div>
        )}

        {tab === "operators" && filteredOperators.length > 0 && (
          <div>
            <div className="hidden md:block">
              <div className="grid grid-cols-[70px_1fr_100px_70px_120px_80px_60px_80px] gap-3 px-5 py-2.5 border-b border-border text-[10px] text-muted-foreground uppercase tracking-[0.06em]">
                <SortableHeader label="ID" sortKey="operatorId" currentSort={operatorSort.key} direction={operatorSort.dir} onSort={(k) => toggleOperatorSort(k as OperatorSortKey)} />
                <span>Address</span>
                <div className="text-right">
                  <SortableHeader label="Stake" sortKey="stake" currentSort={operatorSort.key} direction={operatorSort.dir} onSort={(k) => toggleOperatorSort(k as OperatorSortKey)} />
                </div>
                <span className="text-right">Deleg.</span>
                <SortableHeader label="Uptime" sortKey="uptimePercent" currentSort={operatorSort.key} direction={operatorSort.dir} onSort={(k) => toggleOperatorSort(k as OperatorSortKey)} />
                <div className="text-right">
                  <SortableHeader label="Jobs" sortKey="jobsCompleted" currentSort={operatorSort.key} direction={operatorSort.dir} onSort={(k) => toggleOperatorSort(k as OperatorSortKey)} />
                </div>
                <span className="text-right">Slash</span>
                <SortableHeader label="Rep." sortKey="reputation" currentSort={operatorSort.key} direction={operatorSort.dir} onSort={(k) => toggleOperatorSort(k as OperatorSortKey)} />
              </div>
              {paginatedOperators.map((op) => (
                <div
                  key={op.operatorId}
                  className="grid grid-cols-[70px_1fr_100px_70px_120px_80px_60px_80px] gap-3 items-center px-5 py-2.5 border-b border-border last:border-0 text-sm hover:bg-secondary/30 transition-colors"
                >
                  <Link
                    href={`/depin/operator/${op.operatorId}`}
                    className="font-mono-data font-medium text-primary hover:underline"
                  >
                    {op.operatorId}
                  </Link>
                  <HashLink hash={op.address} type="address" />
                  <span className="text-right font-mono-data tabular-nums">
                    {parseInt(op.stake).toLocaleString()}
                  </span>
                  <span className="text-right font-mono-data text-muted-foreground tabular-nums">
                    {op.delegations}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          op.uptimePercent > 95
                            ? "bg-[#22C55E]"
                            : op.uptimePercent > 80
                              ? "bg-[#EB5757]"
                              : "bg-[#EB5757]"
                        }`}
                        style={{ width: `${Math.min(op.uptimePercent, 100)}%` }}
                      />
                    </div>
                    <span className="font-mono-data text-[10px] text-muted-foreground tabular-nums">
                      {op.uptimePercent.toFixed(1)}%
                    </span>
                  </div>
                  <span className="text-right font-mono-data text-muted-foreground tabular-nums">
                    {op.jobsCompleted.toLocaleString()}
                  </span>
                  <span
                    className={`text-right font-mono-data tabular-nums ${
                      op.slashes > 0 ? "text-[#EB5757]" : "text-muted-foreground"
                    }`}
                  >
                    {op.slashes}
                  </span>
                  <span
                    className={`font-mono-data font-medium ${
                      op.reputation > 80
                        ? "text-[#22C55E]"
                        : op.reputation > 50
                          ? "text-[#EB5757]"
                          : "text-[#EB5757]"
                    }`}
                  >
                    {op.reputation}/100
                  </span>
                </div>
              ))}
            </div>
            <div className="md:hidden p-3 space-y-3">
              {paginatedOperators.map((op) => (
                <MobileCard
                  key={op.operatorId}
                  onClick={() => router.push(`/depin/operator/${op.operatorId}`)}
                  rows={[
                    {
                      label: "Operator ID",
                      value: <span className="font-mono-data text-primary">{op.operatorId}</span>,
                    },
                    {
                      label: "Reputation",
                      value: (
                        <span
                          className={`font-mono-data font-medium ${
                            op.reputation > 80
                              ? "text-[#22C55E]"
                              : op.reputation > 50
                                ? "text-[#EB5757]"
                                : "text-[#EB5757]"
                          }`}
                        >
                          {op.reputation}/100
                        </span>
                      ),
                    },
                    {
                      label: "Uptime",
                      value: (
                        <span className="font-mono-data">{op.uptimePercent.toFixed(1)}%</span>
                      ),
                    },
                    {
                      label: "Jobs",
                      value: (
                        <span className="font-mono-data">
                          {op.jobsCompleted.toLocaleString()}
                        </span>
                      ),
                    },
                  ]}
                />
              ))}
            </div>
            <div className="px-5 py-3 border-t border-border">
              <Pagination
                currentPage={operatorPage}
                totalPages={operatorTotalPages}
                onPageChange={setOperatorPage}
                pageSize={PAGE_SIZE}
                totalItems={filteredOperators.length}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
