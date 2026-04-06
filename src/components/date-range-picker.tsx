"use client";

const PRESETS = ["24h", "7d", "30d", "90d", "All"] as const;

interface DateRangePickerProps {
  value: string;
  onChange: (preset: string) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  return (
    <div className="flex gap-1">
      {PRESETS.map((preset) => (
        <button
          key={preset}
          type="button"
          onClick={() => onChange(preset)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            value === preset
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          {preset}
        </button>
      ))}
    </div>
  );
}
