"use client";

import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

interface TimeAgoProps {
  timestamp: string | Date;
}

export function TimeAgo({ timestamp }: TimeAgoProps) {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    setLabel(getTimeAgo(date));
    const interval = setInterval(() => setLabel(getTimeAgo(date)), 30_000);
    return () => clearInterval(interval);
  }, [date.getTime()]);

  // Render nothing on server, hydrate on client to avoid mismatch
  if (label === null) {
    return <span className="text-muted-foreground text-sm whitespace-nowrap">&nbsp;</span>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="text-muted-foreground text-[inherit] cursor-default whitespace-nowrap">
          {label}
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{date.toLocaleString()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
