"use client";

import { useState, useEffect } from "react";
import { getDevMode } from "@/lib/dev-mode";
import { Code2 } from "lucide-react";

interface DevModeSectionProps {
  children: React.ReactNode;
  label?: string;
}

export function DevModeSection({ children, label = "Developer Data" }: DevModeSectionProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(getDevMode());
    const handler = () => setShow(getDevMode());
    window.addEventListener("devmode-change", handler);
    return () => window.removeEventListener("devmode-change", handler);
  }, []);

  if (!show) return null;

  return (
    <div className="rounded-lg border border-[#FFC933]/20 bg-[#FFC933]/5 overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[#FFC933]/20">
        <Code2 className="h-3.5 w-3.5 text-[#FFC933]" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#FFC933]">{label}</span>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}
