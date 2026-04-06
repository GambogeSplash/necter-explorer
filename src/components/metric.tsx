interface MetricProps {
  label: string;
  value: string;
  unit?: string;
  change?: string;
  size?: "sm" | "md" | "lg";
}

export function Metric({ label, value, unit, change, size = "md" }: MetricProps) {
  const valueSize = size === "lg" ? "text-[32px]" : size === "md" ? "text-[24px]" : "text-[18px]";
  const unitSize = size === "lg" ? "text-[16px]" : size === "md" ? "text-[14px]" : "text-[12px]";

  const changeColor = change?.startsWith("+")
    ? "text-[#22C55E]"
    : change?.startsWith("-")
    ? "text-[#EB5757]"
    : "text-muted-foreground";

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground mb-1">
        {label}
      </p>
      <div className="flex items-baseline gap-1.5">
        <span className={`${valueSize} font-semibold font-mono-data tracking-tight`}>
          {value}
        </span>
        {unit && (
          <span className={`${unitSize} text-muted-foreground font-normal`}>{unit}</span>
        )}
        {change && (
          <span className={`text-[11px] font-medium ${changeColor}`}>{change}</span>
        )}
      </div>
    </div>
  );
}
