"use client";

import { useEffect, useState } from "react";

interface CountUpProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function CountUp({ value, duration = 1200, prefix = "", suffix = "", decimals = 0, className }: CountUpProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(eased * value);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, duration]);

  const formatted = decimals > 0 ? current.toFixed(decimals) : Math.floor(current).toLocaleString();
  return <span className={className}>{prefix}{formatted}{suffix}</span>;
}
