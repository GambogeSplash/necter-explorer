"use client";

// localStorage-based watchlist
const STORAGE_KEY = "necter_watchlist_v1";

export interface WatchlistItem {
  type: "address" | "token" | "contract" | "operator" | "device";
  id: string; // address hash, token symbol, device ID, etc.
  label?: string; // user-defined label
  addedAt: string;
}

export function getWatchlist(): WatchlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addToWatchlist(item: Omit<WatchlistItem, "addedAt">) {
  const list = getWatchlist();
  if (list.some((w) => w.id === item.id && w.type === item.type)) return;
  list.push({ ...item, addedAt: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("watchlist-change"));
}

export function removeFromWatchlist(id: string, type: string) {
  const list = getWatchlist().filter(
    (w) => !(w.id === id && w.type === type)
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("watchlist-change"));
}

export function isWatched(id: string, type: string): boolean {
  return getWatchlist().some((w) => w.id === id && w.type === type);
}

export function updateWatchlistLabel(id: string, type: string, label: string) {
  const list = getWatchlist();
  const item = list.find((w) => w.id === id && w.type === type);
  if (item) {
    item.label = label;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("watchlist-change"));
  }
}
