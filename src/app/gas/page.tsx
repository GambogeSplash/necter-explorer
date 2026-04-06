"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Fuel, TrendingDown, Lightbulb, Clock, Bell, Calculator } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { DateRangePicker } from "@/components/date-range-picker";
import { PageTitle } from "@/components/page-title";
import { showToast } from "@/components/toast";

const CHART_TOOLTIP = {
  backgroundColor: "#131315",
  border: "1px solid rgba(255,245,230,0.07)",
  borderRadius: 8,
  fontSize: 12,
  color: "#F9F9F6",
};

// Deterministic pseudo-random using the (i * 7919 + 31) % 997 pattern
function deterministicRand(i: number) {
  return ((i * 7919 + 31) % 997) / 997;
}

// Generate 24h gas price history (one point per 15 min = 96 points)
function generateGasPriceHistory() {
  const data = [];
  let price = 0.001;
  for (let i = 0; i < 96; i++) {
    const r = deterministicRand(i + 42);
    price = Math.max(0.0003, Math.min(0.002, price + (r - 0.5) * 0.0003));
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    data.push({
      timestamp: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
      price: parseFloat(price.toFixed(6)),
    });
  }
  return data;
}

// Generate gas usage by hour (24 bars)
function generateGasUsageByHour() {
  const data = [];
  for (let h = 0; h < 24; h++) {
    const r = deterministicRand(h + 123);
    const base = h >= 2 && h <= 6 ? 20 : h >= 10 && h <= 18 ? 80 : 50;
    const usage = Math.round(base + r * 30);
    data.push({
      hour: `${h.toString().padStart(2, "0")}:00`,
      usage,
    });
  }
  return data;
}

// Generate heatmap data: 7 days x 24 hours
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function generateHeatmapData() {
  const data: { day: string; hour: number; value: number }[] = [];
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const seed = d * 24 + h;
      const r = deterministicRand(seed + 500);
      // weekday afternoons high, nights low, weekends lower
      const isWeekend = d >= 5;
      const isAfternoon = h >= 12 && h <= 18;
      const isNight = h >= 0 && h <= 6;
      let base: number;
      if (isWeekend) {
        base = isNight ? 0.0003 : isAfternoon ? 0.0007 : 0.0005;
      } else {
        base = isNight ? 0.0003 : isAfternoon ? 0.0014 : 0.0008;
      }
      const value = parseFloat((base + r * 0.0004).toFixed(6));
      data.push({ day: DAYS[d], hour: h, value });
    }
  }
  return data;
}

function getHeatmapColor(value: number): string {
  if (value < 0.0005) return "#1B1B1F";
  if (value < 0.0008) return "#25252A";
  if (value < 0.0012) return "rgba(255,201,51,0.2)";
  return "rgba(255,201,51,0.5)";
}

const gasPriceHistory = generateGasPriceHistory();
const gasUsageByHour = generateGasUsageByHour();
const heatmapData = generateHeatmapData();

// Current gas price for calculator
const CURRENT_GAS_PRICE = 0.001; // gwei
const NECTA_USD_PRICE = 0.42; // mock USD price per NECTA
const ETH_L1_GAS_PRICE = 30; // gwei for comparison

const TX_TYPES = [
  { label: "Transfer", defaultGas: 21_000 },
  { label: "Contract Call", defaultGas: 100_000 },
  { label: "Job Post", defaultGas: 150_000 },
  { label: "Attestation", defaultGas: 65_000 },
  { label: "Stake", defaultGas: 80_000 },
] as const;

function getBarColor(usage: number) {
  if (usage < 40) return "#777470";
  if (usage < 70) return "#22C55E";
  return "#FFC933";
}

export default function GasPage() {
  const [dateRange, setDateRange] = useState("24h");

  // Live gas tick for Standard tier
  const [gasTick, setGasTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setGasTick(p => p + 1), 2000);
    return () => clearInterval(interval);
  }, []);

  // Gas Calculator state
  const [txTypeIndex, setTxTypeIndex] = useState(0);
  const [gasLimit, setGasLimit] = useState<number>(TX_TYPES[0].defaultGas);

  // Heatmap tooltip state
  const [hoveredCell, setHoveredCell] = useState<{ day: string; hour: number; value: number; x: number; y: number } | null>(null);

  // Gas Alert state
  const [alertThreshold, setAlertThreshold] = useState("");
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [savedAlert, setSavedAlert] = useState<{ threshold: string; enabled: boolean } | null>(null);

  // Load saved alert from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("necter_gas_alert");
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedAlert(parsed);
        setAlertThreshold(parsed.threshold);
        setAlertEnabled(parsed.enabled);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Calculator computations
  const calcResult = useMemo(() => {
    const gasCostGwei = gasLimit * CURRENT_GAS_PRICE;
    const gasCostNecta = gasCostGwei * 1e-9; // gwei to NECTA
    const gasCostUsd = gasCostNecta * NECTA_USD_PRICE;
    const ethCostGwei = gasLimit * ETH_L1_GAS_PRICE;
    const ethCostUsd = ethCostGwei * 1e-9 * 3200; // rough ETH price
    const savings = ethCostUsd > 0 ? ((1 - gasCostUsd / ethCostUsd) * 100) : 0;
    return {
      necta: gasCostNecta.toFixed(10),
      usd: gasCostUsd.toFixed(6),
      savingsPercent: savings.toFixed(1),
    };
  }, [gasLimit]);

  const handleTxTypeChange = (index: number) => {
    setTxTypeIndex(index);
    setGasLimit(TX_TYPES[index].defaultGas);
  };

  const handleSaveAlert = () => {
    if (!alertThreshold || parseFloat(alertThreshold) <= 0) return;
    const alertData = { threshold: alertThreshold, enabled: alertEnabled };
    localStorage.setItem("necter_gas_alert", JSON.stringify(alertData));
    setSavedAlert(alertData);
    showToast("Gas alert set!", "success");
  };

  return (
    <div className="px-2.5 py-2 space-y-4">
      <PageTitle title="Gas Station" />
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-secondary p-2">
              <Fuel className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                Gas Station
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Gas Prices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fast */}
        <div className="rounded-lg bg-card border border-border p-5 cursor-pointer active:scale-[0.98] transition-transform">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Submit Now
            </h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#22C55E]/10 text-[#22C55E]">
              Fast ~2s
            </span>
          </div>
          <p className="text-3xl font-semibold font-mono-data text-foreground">
            0.001
          </p>
          <p className="text-xs text-muted-foreground mt-1">gwei</p>
        </div>

        {/* Standard */}
        <div className="rounded-lg bg-card border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Standard
            </h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#FFC933]/10 text-[#FFC933]">
              Normal ~6s
            </span>
          </div>
          <p className="text-3xl font-semibold font-mono-data text-foreground">
            <span key={gasTick} className="number-tick inline-block">
              {`0.001${gasTick % 2 === 0 ? "0" : "1"}`}
            </span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">gwei</p>
        </div>

        {/* Economy */}
        <div className="rounded-lg bg-card border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Economy
            </h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-secondary text-muted-foreground">
              Slow ~30s
            </span>
          </div>
          <p className="text-3xl font-semibold font-mono-data text-foreground">
            0.0005
          </p>
          <p className="text-xs text-muted-foreground mt-1">gwei</p>
        </div>
      </div>

      {/* Gas Price History */}
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-medium">Gas Price History</h2>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
        <div className="px-5 py-4">
          <div className="chart-reveal">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={gasPriceHistory}>
              <defs>
                <linearGradient id="gasGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFC933" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#FFC933" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="timestamp"
                tick={{ fontSize: 10, fill: "#777470" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#777470" }}
                axisLine={false}
                tickLine={false}
                width={50}
                tickFormatter={(v: number) => v.toFixed(4)}
              />
              <Tooltip
                contentStyle={CHART_TOOLTIP}
                formatter={
                  ((v: number) => [
                    `${v.toFixed(6)} gwei`,
                    "Gas Price",
                  ]) as never
                }
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#FFC933"
                strokeWidth={2}
                fill="url(#gasGrad)"
                name="Gas Price"
              />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Gas Calculator */}
      <div className="rounded-lg bg-card border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-medium">Gas Calculator</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">
                Transaction Type
              </label>
              <select
                value={txTypeIndex}
                onChange={(e) => handleTxTypeChange(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#FFC933]/50"
              >
                {TX_TYPES.map((t, i) => (
                  <option key={t.label} value={i}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">
                Gas Limit
              </label>
              <input
                type="number"
                value={gasLimit}
                onChange={(e) => setGasLimit(Math.max(0, Number(e.target.value)))}
                className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm font-mono-data text-foreground focus:outline-none focus:ring-1 focus:ring-[#FFC933]/50"
              />
            </div>
          </div>

          {/* Output */}
          <div className="space-y-3 rounded-md bg-secondary border border-border p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Estimated Gas Cost
              </span>
              <span className="text-sm font-mono-data font-medium text-foreground">
                {calcResult.necta} NECTA
              </span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Estimated USD Cost
              </span>
              <span className="text-sm font-mono-data font-medium text-foreground">
                ${calcResult.usd}
              </span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                vs Ethereum L1
              </span>
              <span className="text-sm font-medium text-[#22C55E]">
                {calcResult.savingsPercent}% cheaper
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gas Usage by Hour */}
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-medium">Gas Usage by Hour of Day</h2>
        </div>
        <div className="px-5 py-4">
          <div className="chart-reveal">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={gasUsageByHour}>
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 10, fill: "#777470" }}
                axisLine={false}
                tickLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#777470" }}
                axisLine={false}
                tickLine={false}
                width={36}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                contentStyle={CHART_TOOLTIP}
                formatter={
                  ((v: number) => [`${v}%`, "Utilization"]) as never
                }
              />
              <Bar dataKey="usage" radius={[4, 4, 0, 0]} name="Usage">
                {gasUsageByHour.map((entry, index) => (
                  <Cell key={index} fill={getBarColor(entry.usage)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Gas Patterns Heatmap */}
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-medium">Gas Patterns by Time</h2>
        </div>
        <div className="px-5 py-4 relative overflow-x-auto">
          {/* Hour labels */}
          <div className="flex ml-10 mb-1.5 min-w-[472px]">
            {Array.from({ length: 24 }, (_, h) => (
              <div
                key={h}
                className="text-[9px] text-muted-foreground text-center"
                style={{ width: 16, marginRight: 2 }}
              >
                {h % 3 === 0 ? h : ""}
              </div>
            ))}
          </div>
          {/* Rows */}
          {DAYS.map((day) => (
            <div key={day} className="flex items-center mb-[2px] min-w-[472px]">
              <span className="text-[10px] text-muted-foreground w-10 shrink-0">
                {day}
              </span>
              <div className="flex">
                {Array.from({ length: 24 }, (_, h) => {
                  const cell = heatmapData.find(
                    (c) => c.day === day && c.hour === h
                  )!;
                  return (
                    <div
                      key={h}
                      className="cursor-pointer rounded-[2px]"
                      style={{
                        width: 16,
                        height: 16,
                        marginRight: 2,
                        backgroundColor: getHeatmapColor(cell.value),
                      }}
                      onMouseEnter={(e) => {
                        const rect = (e.target as HTMLElement).getBoundingClientRect();
                        setHoveredCell({
                          day,
                          hour: h,
                          value: cell.value,
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        });
                      }}
                      onMouseLeave={() => setHoveredCell(null)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
          {/* Tooltip */}
          {hoveredCell && (
            <div
              className="fixed z-50 px-3 py-2 rounded-lg text-xs pointer-events-none"
              style={{
                left: hoveredCell.x,
                top: hoveredCell.y - 40,
                transform: "translateX(-50%)",
                backgroundColor: "#131315",
                border: "1px solid rgba(255,245,230,0.07)",
                color: "#F9F9F6",
              }}
            >
              {hoveredCell.day} {hoveredCell.hour.toString().padStart(2, "0")}:00 — Avg: {hoveredCell.value.toFixed(4)} gwei
            </div>
          )}
          {/* Legend */}
          <div className="flex items-center gap-3 mt-4 text-[10px] text-muted-foreground">
            <span>Low</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: "#1B1B1F" }} />
              <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: "#25252A" }} />
              <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: "rgba(255,201,51,0.2)" }} />
              <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: "rgba(255,201,51,0.5)" }} />
            </div>
            <span>High</span>
          </div>
        </div>
      </div>

      {/* Gas Forecast + Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gas Forecast */}
        <div className="rounded-lg bg-card border border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium">Gas Forecast</h2>
          </div>
          <div className="px-5 py-2 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Next 10 minutes
              </span>
              <span className="font-mono-data text-sm text-foreground">
                0.0008 - 0.0012 gwei
              </span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Next hour</span>
              <span className="font-mono-data text-sm text-foreground">
                0.0006 - 0.0014 gwei
              </span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center gap-2 pt-1">
              <TrendingDown className="h-4 w-4 text-[#22C55E]" />
              <span className="text-sm text-[#22C55E] font-medium">
                Gas prices trending lower
              </span>
            </div>
          </div>
        </div>

        {/* Gas Tips */}
        <div className="rounded-lg bg-card border border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-[#FFC933]" />
            <h2 className="text-sm font-medium">Gas Tips</h2>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <span className="text-[#FFC933] shrink-0 mt-0.5">
                <Fuel className="h-3.5 w-3.5" />
              </span>
              <p className="text-muted-foreground">
                Necter L2 gas is{" "}
                <span className="text-foreground font-medium">
                  100x cheaper
                </span>{" "}
                than Ethereum L1
              </p>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-start gap-3 text-sm">
              <span className="text-[#22C55E] shrink-0 mt-0.5">
                <Fuel className="h-3.5 w-3.5" />
              </span>
              <p className="text-muted-foreground">
                Avg transaction cost:{" "}
                <span className="text-foreground font-mono-data font-medium">
                  $0.0004
                </span>
              </p>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-start gap-3 text-sm">
              <span className="text-[#6E9FFF] shrink-0 mt-0.5">
                <Clock className="h-3.5 w-3.5" />
              </span>
              <p className="text-muted-foreground">
                Best time to transact:{" "}
                <span className="text-foreground font-medium">
                  02:00 - 06:00 UTC
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gas Alerts */}
      <div className="rounded-lg bg-card border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-medium">Gas Alerts</h2>
        </div>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <label className="text-sm text-muted-foreground shrink-0">
              Alert when gas drops below
            </label>
            <div className="relative w-full sm:flex-1 sm:max-w-[200px]">
              <input
                type="number"
                step="0.0001"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(e.target.value)}
                placeholder="0.0005"
                className="w-full h-9 px-3 pr-14 rounded-md bg-secondary border border-border text-sm font-mono-data text-foreground focus:outline-none focus:ring-1 focus:ring-[#FFC933]/50"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                gwei
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAlertEnabled(!alertEnabled)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                alertEnabled ? "bg-[#22C55E]" : "bg-secondary border border-border"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${
                  alertEnabled ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
            <span className="text-sm text-muted-foreground">
              {alertEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            You&apos;ll be notified when gas price reaches your target
          </p>
          {savedAlert && (
            <div className="text-xs text-muted-foreground bg-secondary rounded-md px-3 py-2 border border-border">
              Current alert: below <span className="font-mono-data text-foreground">{savedAlert.threshold}</span> gwei
              {" "}({savedAlert.enabled ? "enabled" : "disabled"})
            </div>
          )}
          <button
            onClick={handleSaveAlert}
            className="n-btn n-btn--primary n-btn--sm"
          >
            Save Alert
          </button>
        </div>
      </div>
    </div>
  );
}
