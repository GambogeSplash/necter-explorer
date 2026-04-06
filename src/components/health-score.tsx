"use client";

import { PieChart, Pie, Cell } from "recharts";

const score = 94;
const maxScore = 100;

const metrics = [
  { label: "TPS Health", value: 96 },
  { label: "Uptime", value: 99.8 },
  { label: "Finality", value: 92 },
  { label: "Active Devices", value: 88 },
  { label: "Staking Ratio", value: 91 },
];

function getScoreColor(s: number) {
  if (s > 80) return "#22C55E";
  if (s > 60) return "#FFC933";
  return "#EB5757";
}

function getScoreLabel(s: number) {
  if (s > 80) return "Excellent";
  if (s > 60) return "Good";
  return "Poor";
}

export function HealthScore() {
  const color = getScoreColor(score);
  const filled = (score / maxScore) * 100;

  const gaugeData = [
    { value: filled },
    { value: 100 - filled },
  ];

  return (
    <div
      className="rounded-lg bg-card border border-border p-6"
      style={{ boxShadow: "0 0 30px rgba(255,201,51,0.06)" }}
    >
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Left: Gauge */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative" style={{ width: 180, height: 110 }}>
            <PieChart width={180} height={110}>
              <Pie
                data={gaugeData}
                cx={90}
                cy={100}
                startAngle={180}
                endAngle={0}
                innerRadius={60}
                outerRadius={80}
                dataKey="value"
                stroke="none"
              >
                <Cell fill={color} />
                <Cell fill="hsl(var(--secondary))" />
              </Pie>
            </PieChart>
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
              <div className="flex items-baseline gap-0.5">
                <span className="text-3xl font-bold font-mono-data" style={{ color }}>
                  {score}
                </span>
                <span className="text-sm text-muted-foreground font-mono-data">/ {maxScore}</span>
              </div>
            </div>
          </div>
          <span className="text-xs font-medium mt-1" style={{ color }}>
            {getScoreLabel(score)}
          </span>
          <span className="text-[11px] text-muted-foreground mt-0.5">Network Health Score</span>
        </div>

        {/* Right: Metric Breakdown */}
        <div className="flex-1 w-full space-y-3">
          {metrics.map((m) => {
            const barColor = getScoreColor(m.value);
            return (
              <div key={m.label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{m.label}</span>
                  <span className="font-mono-data text-sm">{m.value}<span className="text-muted-foreground text-xs">/{maxScore}</span></span>
                </div>
                <div className="h-1 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${m.value}%`, backgroundColor: barColor }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
