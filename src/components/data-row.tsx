interface DataRowProps {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}

export function DataRow({ label, value, mono }: DataRowProps) {
  return (
    <div className="flex items-center py-2.5 px-3 -mx-3 rounded-lg hover:bg-secondary transition-colors">
      <span className="text-[13px] text-muted-foreground w-[160px] shrink-0">{label}</span>
      <span className={`text-[13px] ${mono ? "font-mono-data" : ""}`}>{value}</span>
    </div>
  );
}
