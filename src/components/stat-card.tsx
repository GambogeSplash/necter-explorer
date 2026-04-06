import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
}

export function StatCard({ title, value, change, icon: Icon, trend = "neutral" }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 card-hover">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">{title}</p>
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
      </div>
      <div className="flex items-baseline gap-1.5">
        <p className="text-[18px] font-semibold font-mono-data tracking-tight">{value}</p>
        {change && (
          <span className={`text-[11px] font-medium ${
            trend === "up" ? "text-[#22C55E]" : trend === "down" ? "text-[#EB5757]" : "text-muted-foreground"
          }`}>{change}</span>
        )}
      </div>
    </div>
  );
}
