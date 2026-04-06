"use client";

const STORAGE_KEY = "necter_wallet_v1";

export interface WalletState {
  address: string;
  walletName: string;
  connected: boolean;
}

export function getWallet(): WalletState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveWallet(address: string, walletName: string) {
  const state: WalletState = { address, walletName, connected: true };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("wallet-change"));
}

export function disconnectWallet() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("wallet-change"));
}

// Generate a mock address deterministically from wallet name
export function generateMockAddress(walletName: string): string {
  let hash = 0;
  for (let i = 0; i < walletName.length; i++) {
    hash = ((hash << 5) - hash + walletName.charCodeAt(i)) | 0;
  }
  return `0x${Math.abs(hash).toString(16).padStart(8, "0")}D4e5F6a7B8c9D0e1F2a3B4c5D6e7F8a9`;
}
