"use client";

import { useState } from "react";
import { X, Wallet } from "lucide-react";
import { showToast } from "@/components/toast";
import { saveWallet, generateMockAddress } from "@/lib/wallet";

const wallets = [
  { name: "MetaMask", icon: "🦊" },
  { name: "WalletConnect", icon: "🔗" },
  { name: "Coinbase Wallet", icon: "🔵" },
  { name: "Rabby", icon: "🐰" },
];

interface ConnectWalletModalProps {
  open: boolean;
  onClose: () => void;
}

export function ConnectWalletModal({ open, onClose }: ConnectWalletModalProps) {
  const [connecting, setConnecting] = useState<string | null>(null);

  if (!open) return null;

  const handleConnect = async (walletName: string) => {
    setConnecting(walletName);
    // Simulate connection delay
    await new Promise((r) => setTimeout(r, 1500));
    const address = generateMockAddress(walletName);
    saveWallet(address, walletName);
    setConnecting(null);
    onClose();
    showToast(`Connected with ${walletName}`, "success");
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="rounded-lg border border-border bg-card p-6 w-full max-w-sm animate-dialogIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Connect Wallet</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Connect your wallet to track your portfolio, vote on proposals, and manage staking.
        </p>

        <div className="space-y-2">
          {wallets.map((w) => (
            <button
              key={w.name}
              onClick={() => handleConnect(w.name)}
              disabled={connecting !== null}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all text-left ${
                connecting === w.name
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30 hover:bg-secondary"
              } ${connecting !== null && connecting !== w.name ? "opacity-50" : ""}`}
            >
              <span className="text-xl">{w.icon}</span>
              <span className="text-sm font-medium flex-1">{w.name}</span>
              {connecting === w.name && (
                <span className="text-xs text-primary animate-pulse">Connecting...</span>
              )}
            </button>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground mt-4 text-center">
          By connecting, you agree to the Terms of Service
        </p>
      </div>
    </div>
  );
}
