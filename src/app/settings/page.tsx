"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Settings, Monitor, Sun, Bell, Code2, Trash2, Check } from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { showToast } from "@/components/toast";

const CURRENCY_KEY = "necter_currency";
const DENSITY_KEY = "necter_density";

type Currency = "USD" | "EUR" | "GBP";
type Density = "comfortable" | "compact";

export default function SettingsPage() {
  const [currency, setCurrency] = useState<Currency>("USD");
  const [density, setDensity] = useState<Density>("comfortable");
  const [gasAlerts, setGasAlerts] = useState(false);
  const [watchlistAlerts, setWatchlistAlerts] = useState(false);

  useEffect(() => {
    const savedCurrency = localStorage.getItem(CURRENCY_KEY) as Currency | null;
    if (savedCurrency) setCurrency(savedCurrency);
    const savedDensity = localStorage.getItem(DENSITY_KEY) as Density | null;
    if (savedDensity) setDensity(savedDensity);
  }, []);

  const handleCurrencyChange = (value: Currency) => {
    setCurrency(value);
    localStorage.setItem(CURRENCY_KEY, value);
  };

  const handleDensityChange = (value: Density) => {
    setDensity(value);
    localStorage.setItem(DENSITY_KEY, value);
  };

  const handleClearData = () => {
    localStorage.clear();
    setCurrency("USD");
    setDensity("comfortable");
    setGasAlerts(false);
    setWatchlistAlerts(false);
    showToast("All local data cleared");
  };

  return (
    <div className="px-2.5 py-2 space-y-4">
      <PageTitle title="Settings" />

      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="rounded-lg bg-secondary p-2">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage your preferences</p>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Display Preferences */}
        <div className="rounded-lg border border-border bg-card">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-semibold">Display Preferences</h2>
          </div>
          <div className="p-5 space-y-5">
            {/* Currency */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium">Currency</p>
                <p className="text-xs text-muted-foreground mt-0.5">Display prices in your preferred currency</p>
              </div>
              <select
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value as Currency)}
                className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            {/* Theme */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium">Theme</p>
                <p className="text-xs text-muted-foreground mt-0.5">Choose your interface theme</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 rounded-lg border border-primary bg-primary/10 px-3 py-1.5 text-sm text-primary">
                  <Monitor className="h-3.5 w-3.5" />
                  Dark
                  <Check className="h-3 w-3" />
                </button>
                <button disabled className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground opacity-50 cursor-not-allowed">
                  <Sun className="h-3.5 w-3.5" />
                  Light
                  <span className="ml-1 inline-flex items-center rounded px-1 py-0.5 text-[10px] bg-secondary text-muted-foreground">Coming soon</span>
                </button>
              </div>
            </div>

            {/* Data Density */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium">Data Density</p>
                <p className="text-xs text-muted-foreground mt-0.5">Adjust row spacing in tables and lists</p>
              </div>
              <div className="flex items-center rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => handleDensityChange("comfortable")}
                  className={`px-3 py-1.5 text-sm transition-colors ${density === "comfortable" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Comfortable
                </button>
                <button
                  onClick={() => handleDensityChange("compact")}
                  className={`px-3 py-1.5 text-sm border-l border-border transition-colors ${density === "compact" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Compact
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="rounded-lg border border-border bg-card">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-semibold">Notification Preferences</h2>
          </div>
          <div className="p-5 space-y-5">
            {/* Gas price alerts */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium">Gas Price Alerts</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Get notified when gas drops below your target.{" "}
                  <Link href="/gas" className="text-primary hover:underline">Configure on Gas page</Link>
                </p>
              </div>
              <button
                onClick={() => setGasAlerts(!gasAlerts)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${gasAlerts ? "bg-primary" : "bg-secondary"}`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full bg-foreground transition-transform ${gasAlerts ? "translate-x-4.5" : "translate-x-0.5"}`}
                />
              </button>
            </div>

            {/* Watchlist activity */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium">Watchlist Activity</p>
                <p className="text-xs text-muted-foreground mt-0.5">Get notified about activity on watched addresses and tokens</p>
              </div>
              <button
                onClick={() => setWatchlistAlerts(!watchlistAlerts)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${watchlistAlerts ? "bg-primary" : "bg-secondary"}`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full bg-foreground transition-transform ${watchlistAlerts ? "translate-x-4.5" : "translate-x-0.5"}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Developer */}
        <div className="rounded-lg border border-border bg-card">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-semibold">Developer</h2>
          </div>
          <div className="p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium">Developer Mode</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Toggle developer mode from the header bar.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Use header toggle</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium">Clear All Local Data</p>
                <p className="text-xs text-muted-foreground mt-0.5">Remove all saved preferences, watchlist, and cached data</p>
              </div>
              <button
                onClick={handleClearData}
                className="flex items-center gap-1.5 rounded-lg border border-[#EB5757]/30 bg-[#EB5757]/10 px-3 py-1.5 text-sm text-[#EB5757] hover:bg-[#EB5757]/20 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
