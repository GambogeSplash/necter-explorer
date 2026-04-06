"use client";

import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  currentSort: string | null;
  direction: "asc" | "desc" | null;
  onSort: (key: string) => void;
}

export function SortableHeader({
  label,
  sortKey,
  currentSort,
  direction,
  onSort,
}: SortableHeaderProps) {
  const isActive = currentSort === sortKey;

  const Icon =
    isActive && direction === "asc"
      ? ArrowUp
      : isActive && direction === "desc"
      ? ArrowDown
      : ArrowUpDown;

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className="text-[11px] text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors inline-flex items-center"
    >
      {label}
      <Icon className="h-3 w-3 ml-1 inline" />
    </button>
  );
}
