"use client";

import { PieChart, Pie, Cell } from "recharts";

interface GaugeChartProps {
  value: number;
  label: string;
  color?: string;
  size?: number;
}

export function GaugeChart({
  value,
  label,
  color = "#FFC933",
  size = 160,
}: GaugeChartProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const data = [
    { value: clamped },
    { value: 100 - clamped },
  ];

  const innerRadius = size * 0.35;
  const outerRadius = size * 0.45;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 }}>
        <PieChart width={size} height={size / 2}>
          <Pie
            data={data}
            cx={size / 2}
            cy={size / 2}
            startAngle={180}
            endAngle={0}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={color} />
            <Cell fill="#1B1B1F" />
          </Pie>
        </PieChart>
        <div
          className="absolute inset-0 flex items-end justify-center pb-1"
          style={{ height: size / 2 }}
        >
          <span className="text-2xl font-semibold">{clamped}%</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground mt-1">{label}</span>
    </div>
  );
}
