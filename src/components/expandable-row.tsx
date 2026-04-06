"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ExpandableRowProps {
  children: ReactNode;
  detail: ReactNode;
  className?: string;
}

export function ExpandableRow({ children, detail, className }: ExpandableRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className={`cursor-pointer hover:bg-secondary transition-colors ${className ?? ""}`}
        onClick={() => setExpanded((prev) => !prev)}
      >
        <td className="w-8 pl-2">
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </td>
        {children}
      </tr>
      {expanded && (
        <tr>
          <td
            colSpan={100}
            className="px-5 py-4 bg-secondary border-b border-border animate-slideUp"
          >
            {detail}
          </td>
        </tr>
      )}
    </>
  );
}
