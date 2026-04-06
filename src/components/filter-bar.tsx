"use client";

import { Search } from "lucide-react";

export interface FilterConfig {
  key: string;
  label: string;
  type: "select" | "search" | "range";
  options?: { value: string; label: string }[];
}

interface FilterBarProps {
  filters: FilterConfig[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onClear: () => void;
}

function hasActiveFilters(values: Record<string, any>): boolean {
  return Object.values(values).some((v) => {
    if (v == null || v === "") return false;
    if (typeof v === "object" && "min" in v && "max" in v) {
      return v.min !== "" || v.max !== "";
    }
    return true;
  });
}

function countActiveFilters(values: Record<string, any>): number {
  return Object.values(values).filter((v) => {
    if (v == null || v === "") return false;
    if (typeof v === "object" && "min" in v && "max" in v) {
      return v.min !== "" || v.max !== "";
    }
    return true;
  }).length;
}

export function FilterBar({ filters, values, onChange, onClear }: FilterBarProps) {
  const active = hasActiveFilters(values);
  const activeCount = countActiveFilters(values);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {filters.map((filter) => {
        switch (filter.type) {
          case "select":
            return (
              <select
                key={filter.key}
                value={values[filter.key] ?? ""}
                onChange={(e) => onChange(filter.key, e.target.value)}
                className="h-8 px-2 rounded-md text-sm bg-secondary border border-border text-foreground"
              >
                <option value="">{filter.label}</option>
                {filter.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            );

          case "search":
            return (
              <div key={filter.key} className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder={filter.label}
                  value={values[filter.key] ?? ""}
                  onChange={(e) => onChange(filter.key, e.target.value)}
                  className="h-8 pl-7 pr-2 rounded-md text-sm bg-secondary border border-border text-foreground placeholder:text-muted-foreground w-44"
                />
              </div>
            );

          case "range":
            return (
              <div key={filter.key} className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="Min"
                  value={values[filter.key]?.min ?? ""}
                  onChange={(e) =>
                    onChange(filter.key, {
                      ...values[filter.key],
                      min: e.target.value,
                    })
                  }
                  className="h-8 px-2 rounded-md text-sm bg-secondary border border-border text-foreground w-20"
                />
                <span className="text-xs text-muted-foreground">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={values[filter.key]?.max ?? ""}
                  onChange={(e) =>
                    onChange(filter.key, {
                      ...values[filter.key],
                      max: e.target.value,
                    })
                  }
                  className="h-8 px-2 rounded-md text-sm bg-secondary border border-border text-foreground w-20"
                />
              </div>
            );

          default:
            return null;
        }
      })}

      {active && (
        <>
          <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
            {activeCount}
          </span>
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-primary hover:underline"
          >
            Clear all
          </button>
        </>
      )}
    </div>
  );
}
