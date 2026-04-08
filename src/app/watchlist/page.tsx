"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  X,
  Wallet,
  Coins,
  Users,
  LayoutList,
  Pencil,
  Check,
  ArrowUpRight,
  Activity,
  TrendingUp,
  Shield,
  FileText,
} from "lucide-react";
import { HashLink } from "@/components/hash-link";
import { TimeAgo } from "@/components/time-ago";
import { PageTitle } from "@/components/page-title";
import { MobileCard } from "@/components/mobile-card";
import { StatCard } from "@/components/stat-card";
import {
  getWatchlist,
  removeFromWatchlist,
  updateWatchlistLabel,
  type WatchlistItem,
} from "@/lib/watchlist";

const TABS = ["All", "Addresses", "Tokens", "Operators", "Contracts", "Devices"] as const;

const TYPE_FILTER_MAP: Record<string, WatchlistItem["type"] | null> = {
  All: null,
  Addresses: "address",
  Tokens: "token",
  Operators: "operator",
  Contracts: "contract",
  Devices: "device",
};

const TYPE_BADGE: Record<
  WatchlistItem["type"],
  { label: string; color: string; bg: string }
> = {
  address: { label: "Address", color: "text-[#FFC933]", bg: "bg-[#FFC933]/10" },
  token: { label: "Token", color: "text-[#22C55E]", bg: "bg-[#22C55E]/10" },
  operator: { label: "Operator", color: "text-[#6E9FFF]", bg: "bg-[#6E9FFF]/10" },
  contract: { label: "Contract", color: "text-[#6E9FFF]", bg: "bg-[#6E9FFF]/10" },
  device: { label: "Device", color: "text-[#EB5757]", bg: "bg-[#EB5757]/10" },
};

const MOCK_ACTIVITY = [
  {
    icon: ArrowUpRight,
    color: "text-[#FFC933]",
    bg: "bg-[#FFC933]/10",
    description: "0x1a2b...c3d4 received 500 NECTA",
    timeAgo: new Date(Date.now() - 12 * 60_000).toISOString(),
  },
  {
    icon: Activity,
    color: "text-[#6E9FFF]",
    bg: "bg-[#6E9FFF]/10",
    description: "OP-100 completed job JOB-5042",
    timeAgo: new Date(Date.now() - 34 * 60_000).toISOString(),
  },
  {
    icon: TrendingUp,
    color: "text-[#22C55E]",
    bg: "bg-[#22C55E]/10",
    description: "NECTA price changed +2.1%",
    timeAgo: new Date(Date.now() - 2 * 3600_000).toISOString(),
  },
  {
    icon: Shield,
    color: "text-[#EB5757]",
    bg: "bg-[#EB5757]/10",
    description: "DEV-1000 attestation verified",
    timeAgo: new Date(Date.now() - 5 * 3600_000).toISOString(),
  },
  {
    icon: FileText,
    color: "text-[#6E9FFF]",
    bg: "bg-[#6E9FFF]/10",
    description: "Contract DeviceRegistry called 847 times today",
    timeAgo: new Date(Date.now() - 8 * 3600_000).toISOString(),
  },
];

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const loadItems = useCallback(() => {
    setItems(getWatchlist());
  }, []);

  useEffect(() => {
    loadItems();
    window.addEventListener("watchlist-change", loadItems);
    return () => window.removeEventListener("watchlist-change", loadItems);
  }, [loadItems]);

  const [flashId, setFlashId] = useState<string | null>(null);

  const handleRemove = (id: string, type: string) => {
    setFlashId(`${type}-${id}`);
    setTimeout(() => {
      removeFromWatchlist(id, type);
      loadItems();
      setFlashId(null);
    }, 200);
  };

  const handleEditStart = (item: WatchlistItem) => {
    setEditingId(`${item.type}-${item.id}`);
    setEditValue(item.label || "");
  };

  const handleEditSave = (item: WatchlistItem) => {
    updateWatchlistLabel(item.id, item.type, editValue);
    setEditingId(null);
    setEditValue("");
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, item: WatchlistItem) => {
    if (e.key === "Enter") handleEditSave(item);
    if (e.key === "Escape") {
      setEditingId(null);
      setEditValue("");
    }
  };

  const filterType = TYPE_FILTER_MAP[activeTab];
  const filtered = filterType
    ? items.filter((item) => item.type === filterType)
    : items;

  const addressCount = items.filter((i) => i.type === "address").length;
  const tokenCount = items.filter((i) => i.type === "token").length;
  const operatorCount = items.filter((i) => i.type === "operator").length;

  // Portfolio mock value: seeded from address count
  const portfolioValue = addressCount > 0 ? addressCount * 12_847 + (addressCount * 7 % 1000) : 0;

  return (
    <div className="max-w-[1480px] mx-auto px-2.5 py-2 space-y-4">
      <PageTitle title="Watchlist" />
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">My Watchlist</h1>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Tracked Addresses" value={addressCount.toString()} icon={Wallet} />
        <StatCard title="Tracked Tokens" value={tokenCount.toString()} icon={Coins} />
        <StatCard title="Tracked Operators" value={operatorCount.toString()} icon={Users} />
        <StatCard title="Total Items" value={items.length.toString()} icon={LayoutList} />
      </div>

      {/* Portfolio Value Tracker */}
      {addressCount > 0 && (
        <div className="rounded-lg bg-card border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium">Portfolio Overview</h2>
            <span className="text-[11px] text-muted-foreground">
              Across {addressCount} tracked address{addressCount !== 1 ? "es" : ""}
            </span>
          </div>
          <p className="text-3xl font-semibold font-mono-data tracking-tight">
            ${portfolioValue.toLocaleString()}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === tab
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Items List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Image
            src="/brand/3d/bee-dark.png"
            alt=""
            width={120}
            height={120}
            className="opacity-60 mb-6"
          />
          <h3 className="text-sm font-medium text-foreground mb-1">
            No items tracked yet
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            Start tracking by clicking the star button on any address, token, or
            operator page throughout the explorer.
          </p>
        </div>
      ) : (
        <>
        <div className="hidden md:block rounded-lg bg-card border border-border overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[100px_1fr_1fr_140px_80px] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
            <span>Type</span>
            <span>ID</span>
            <span>Label</span>
            <span>Added</span>
            <span />
          </div>

          {/* Rows */}
          {filtered.map((item) => {
            const badge = TYPE_BADGE[item.type];
            const itemKey = `${item.type}-${item.id}`;
            const isEditing = editingId === itemKey;
            return (
              <div
                key={itemKey}
                className={`row-hover grid grid-cols-[100px_1fr_1fr_140px_80px] gap-3 items-center px-5 py-2.5 border-b border-border last:border-0 text-sm transition-colors duration-200 ${flashId === itemKey ? "bg-[#EB5757]/10" : ""}`}
              >
                {/* Type badge */}
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium w-fit ${badge.bg} ${badge.color}`}
                >
                  {badge.label}
                </span>

                {/* ID */}
                <div className="min-w-0">
                  {item.type === "address" ? (
                    <HashLink hash={item.id} type="address" />
                  ) : (
                    <span className="font-mono-data text-foreground">
                      {item.id}
                    </span>
                  )}
                  {item.label && !isEditing && (
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{item.label}</p>
                  )}
                </div>

                {/* Label */}
                <span className="text-muted-foreground text-xs truncate">
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => handleEditKeyDown(e, item)}
                        className="w-full bg-secondary border border-border rounded px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
                        autoFocus
                        placeholder="Add a label..."
                      />
                      <button
                        onClick={() => handleEditSave(item)}
                        className="p-1 rounded text-[#22C55E] hover:bg-[#22C55E]/10 transition-colors"
                        title="Save label"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    item.label || "--"
                  )}
                </span>

                {/* Added date */}
                <TimeAgo timestamp={item.addedAt} />

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditStart(item)}
                    className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                    title="Edit label"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleRemove(item.id, item.type)}
                    className="p-1 rounded text-muted-foreground hover:text-[#EB5757] transition-colors"
                    title="Remove from watchlist"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="md:hidden space-y-3">
          {filtered.map((item) => {
            const badge = TYPE_BADGE[item.type];
            const itemKey = `${item.type}-${item.id}`;
            const isEditing = editingId === itemKey;
            return (
              <MobileCard
                key={itemKey}
                rows={[
                  { label: "Type", value: <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${badge.bg} ${badge.color}`}>{badge.label}</span> },
                  { label: "ID", value: (
                    <div>
                      <span className="font-mono-data text-xs">{item.id.length > 20 ? `${item.id.slice(0, 10)}...${item.id.slice(-6)}` : item.id}</span>
                      {item.label && !isEditing && <p className="text-[11px] text-muted-foreground mt-0.5">{item.label}</p>}
                    </div>
                  ) },
                  { label: "Label", value: isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => handleEditKeyDown(e, item)}
                        className="w-full bg-secondary border border-border rounded px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
                        autoFocus
                        placeholder="Add a label..."
                      />
                      <button onClick={() => handleEditSave(item)} className="p-1 rounded text-[#22C55E]"><Check className="h-3.5 w-3.5" /></button>
                    </div>
                  ) : <span className="text-xs text-muted-foreground">{item.label || "--"}</span> },
                  { label: "Added", value: (
                    <div className="flex items-center gap-2">
                      <TimeAgo timestamp={item.addedAt} />
                      <button onClick={() => handleEditStart(item)} className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors" title="Edit label"><Pencil className="h-3 w-3" /></button>
                      <button onClick={() => handleRemove(item.id, item.type)} className="p-1 rounded text-muted-foreground hover:text-[#EB5757] transition-colors" title="Remove"><X className="h-3.5 w-3.5" /></button>
                    </div>
                  ) },
                ]}
              />
            );
          })}
        </div>
        </>
      )}

      {/* Recent Activity Feed */}
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-semibold tracking-tight">Recent Activity</h2>
          </div>
        {MOCK_ACTIVITY.map((event, i) => {
          const Icon = event.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-3 px-5 py-3 border-b border-border last:border-0"
            >
              <div className={`rounded-lg p-2 shrink-0 ${event.bg}`}>
                <Icon className={`h-4 w-4 ${event.color}`} />
              </div>
              <p className="text-sm text-foreground flex-1">{event.description}</p>
              <TimeAgo timestamp={event.timeAgo} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
