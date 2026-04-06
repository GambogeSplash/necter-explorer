"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import {
  addToWatchlist,
  removeFromWatchlist,
  isWatched,
} from "@/lib/watchlist";
import { showToast } from "@/components/toast";

interface WatchlistButtonProps {
  id: string;
  type: "address" | "token" | "contract" | "operator" | "device";
  label?: string;
}

export function WatchlistButton({ id, type, label }: WatchlistButtonProps) {
  const [watched, setWatched] = useState(false);

  useEffect(() => {
    setWatched(isWatched(id, type));
    const handler = () => setWatched(isWatched(id, type));
    window.addEventListener("watchlist-change", handler);
    return () => window.removeEventListener("watchlist-change", handler);
  }, [id, type]);

  const toggle = () => {
    if (watched) {
      removeFromWatchlist(id, type);
      showToast("Removed from watchlist", "info");
    } else {
      addToWatchlist({ id, type, label });
      showToast("Added to watchlist", "success");
    }
    setWatched(!watched);
  };

  return (
    <button
      onClick={toggle}
      className={`p-1 rounded transition-colors ${
        watched
          ? "text-[#FFC933]"
          : "text-muted-foreground hover:text-[#FFC933]"
      }`}
      title={watched ? "Remove from watchlist" : "Add to watchlist"}
    >
      <Star className={`h-4 w-4 ${watched ? "fill-current" : ""}`} />
    </button>
  );
}
