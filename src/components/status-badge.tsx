const statusStyles: Record<string, string> = {
  // Success states
  active: "bg-[rgba(34,197,94,0.12)] text-[#22C55E]",
  completed: "bg-[rgba(34,197,94,0.12)] text-[#22C55E]",
  passed: "bg-[rgba(34,197,94,0.12)] text-[#22C55E]",
  executed: "bg-[rgba(34,197,94,0.12)] text-[#22C55E]",
  confirmed: "bg-[rgba(34,197,94,0.12)] text-[#22C55E]",
  // Warning states
  pending: "bg-[rgba(242,153,74,0.12)] text-[#F2994A]",
  posted: "bg-[rgba(242,153,74,0.12)] text-[#F2994A]",
  bidding: "bg-[rgba(242,153,74,0.12)] text-[#F2994A]",
  // Info states
  assigned: "bg-[rgba(110,159,255,0.12)] text-[#6E9FFF]",
  proving: "bg-[rgba(110,159,255,0.12)] text-[#6E9FFF]",
  // Error states
  failed: "bg-[rgba(235,87,87,0.12)] text-[#EB5757]",
  rejected: "bg-[rgba(235,87,87,0.12)] text-[#EB5757]",
  slashed: "bg-[rgba(235,87,87,0.12)] text-[#EB5757]",
  disputed: "bg-[rgba(235,87,87,0.12)] text-[#EB5757]",
  // Neutral
  inactive: "bg-secondary text-muted-foreground",
  // Transaction types
  transfer: "bg-[rgba(255,201,51,0.10)] text-[#FFC933]",
  "contract call": "bg-[#9985FF]/10 text-[#9985FF]",
  "job post": "bg-[rgba(242,153,74,0.12)] text-[#F2994A]",
  attestation: "bg-[rgba(34,197,94,0.12)] text-[#22C55E]",
  stake: "bg-[#9985FF]/10 text-[#9985FF]",
  governance: "bg-[#FFC933]/10 text-[#FFC933]",
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const key = status.toLowerCase();
  const style = statusStyles[key] ?? "bg-secondary text-muted-foreground";

  return (
    <span className={`inline-flex items-center rounded-[3px] px-1.5 py-px text-[10px] font-medium capitalize leading-tight ${style}${key === "active" ? " status-pulse" : ""}`}>
      {status}
    </span>
  );
}
