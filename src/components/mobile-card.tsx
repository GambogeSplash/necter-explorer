interface MobileCardProps {
  rows: { label: string; value: React.ReactNode }[];
  className?: string;
  onClick?: () => void;
}

export function MobileCard({ rows, className = "", onClick }: MobileCardProps) {
  return (
    <div
      className={`rounded-lg bg-card border border-border p-4 space-y-2 ${onClick ? "cursor-pointer hover:bg-secondary transition-colors" : ""} ${className}`}
      onClick={onClick}
    >
      {rows.map((row, i) => (
        <div key={i} className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider shrink-0">{row.label}</span>
          <div className="text-sm text-right truncate">{row.value}</div>
        </div>
      ))}
    </div>
  );
}
