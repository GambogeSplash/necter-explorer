"use client";

import { useState, useEffect } from "react";
import { Code2 } from "lucide-react";
import { getDevMode, setDevMode } from "@/lib/dev-mode";

export function DevModeToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(getDevMode());
  }, []);

  const toggle = () => {
    const next = !enabled;
    setDevMode(next);
    setEnabled(next);
  };

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 h-[28px] px-2 rounded-md text-[11px] font-medium transition-colors ${
        enabled
          ? "bg-[#FFC933]/15 text-[#FFC933] border border-[#FFC933]/30"
          : "bg-secondary text-muted-foreground border border-border hover:text-foreground"
      }`}
      title={enabled ? "Switch to Consumer View" : "Switch to Developer View"}
    >
      <Code2 className="h-3 w-3" />
      DEV
    </button>
  );
}
