"use client";
import { Share2 } from "lucide-react";
import { showToast } from "@/components/toast";

export function ShareButton() {
  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copied to clipboard", "success");
    } catch {
      showToast("Could not copy link", "error");
    }
  };

  return (
    <button
      onClick={handleShare}
      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
      title="Share this page"
    >
      <Share2 className="h-4 w-4" />
    </button>
  );
}
