"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Box,
  ArrowLeftRight,
  Cpu,
  Shield,
  Vote,
  BarChart3,
  Menu,
  X,
  Bot,
  Radio,
  Coins,
  Lock,
  FileCode,
  Fuel,
  Scale,
  Star,
  ChevronDown,
} from "lucide-react";
import { SearchDialog } from "@/components/search-dialog";
import { DevModeToggle } from "@/components/dev-mode-toggle";
import { ConnectWalletModal } from "@/components/connect-wallet-modal";
import { getWallet, disconnectWallet, type WalletState } from "@/lib/wallet";
import { getAddressAvatar } from "@/lib/avatar";
import { showToast } from "@/components/toast";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const primaryNav = [
  { label: "Overview", href: "/" },
  { label: "Blocks", href: "/blocks" },
  { label: "Transactions", href: "/transactions" },
  { label: "Tokens", href: "/tokens" },
  { label: "DePIN", href: "/depin" },
  { label: "Staking", href: "/staking" },
  { label: "Governance", href: "/governance" },
  { label: "Analytics", href: "/analytics" },
];

const moreNav = [
  { label: "AI Compute", href: "/ai-compute", icon: Bot },
  { label: "IoT Gateways", href: "/iot", icon: Radio },
  { label: "Contracts", href: "/contracts", icon: FileCode },
  { label: "Sovereignty", href: "/sovereignty", icon: Lock },
  { label: "Gas Station", href: "/gas", icon: Fuel },
  { label: "Compare", href: "/compare", icon: Scale },
  { label: "Watchlist", href: "/watchlist", icon: Star },
  { label: "Settings", href: "/settings", icon: Fuel },
];

const allNavMobile = [
  { label: "Blocks", href: "/blocks", icon: Box },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { label: "Tokens", href: "/tokens", icon: Coins },
  { label: "DePIN", href: "/depin", icon: Cpu },
  { label: "AI Compute", href: "/ai-compute", icon: Bot },
  { label: "IoT", href: "/iot", icon: Radio },
  { label: "Staking", href: "/staking", icon: Shield },
  { label: "Governance", href: "/governance", icon: Vote },
  { label: "Contracts", href: "/contracts", icon: FileCode },
  { label: "Sovereignty", href: "/sovereignty", icon: Lock },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Gas", href: "/gas", icon: Fuel },
  { label: "Compare", href: "/compare", icon: Scale },
  { label: "Watchlist", href: "/watchlist", icon: Star },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [wallet, setWalletState] = useState<WalletState | null>(null);

  useEffect(() => {
    setWalletState(getWallet());
    const h = () => setWalletState(getWallet());
    window.addEventListener("wallet-change", h);
    return () => window.removeEventListener("wallet-change", h);
  }, []);

  useEffect(() => { setMenuOpen(false); setMoreOpen(false); }, [pathname]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "/") { e.preventDefault(); setSearchOpen(true); }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        {/* Single row: logo | nav | search | controls */}
        <div className="px-2.5 flex items-center h-[48px] gap-4">

          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center gap-2">
            <img src="/brand/logo.svg" alt="Necter" className="h-6 w-6" />
            <img src="/brand/NECTER.svg" alt="NECTER" className="h-[9px] w-auto hidden sm:block opacity-70" />
          </Link>

          {/* Nav — desktop */}
          <nav className="hidden md:flex items-center gap-0.5 ml-2">
            {primaryNav.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-2.5 py-1 text-[12px] rounded-md transition-colors ${
                    active
                      ? "text-foreground font-medium bg-secondary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            {/* More dropdown — with padding bridge to prevent close on mouse travel */}
            <div
              className="relative"
              onMouseEnter={() => setMoreOpen(true)}
              onMouseLeave={() => setMoreOpen(false)}
            >
              <button className={`px-2.5 py-1 text-[12px] rounded-md transition-colors flex items-center gap-0.5 ${
                moreNav.some(n => isActive(n.href)) ? "text-foreground font-medium bg-secondary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}>
                More <ChevronDown className={`h-3 w-3 transition-transform ${moreOpen ? "rotate-180 opacity-70" : "opacity-40"}`} />
              </button>
              {moreOpen && (
                <>
                  {/* Invisible bridge between trigger and dropdown */}
                  <div className="absolute top-full left-0 right-0 h-2" />
                  <div className="absolute top-[calc(100%+4px)] left-0 w-48 rounded-lg border border-border bg-card shadow-xl py-1.5 z-50 animate-fadeIn">
                    {moreNav.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-2.5 px-3 py-2 text-[12px] transition-colors rounded-md mx-1 ${
                            active
                              ? "text-primary bg-primary/5 font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex-1 max-w-[380px] ml-auto flex items-center gap-2 h-[32px] px-3 rounded-full bg-secondary text-muted-foreground hover:bg-secondary transition-colors text-[12px]"
          >
            <Search className="h-3.5 w-3.5 opacity-40" />
            <span className="truncate hidden sm:inline">Search</span>
            <kbd className="hidden lg:inline-flex ml-auto text-[9px] font-mono-data bg-background/50 border border-border rounded-sm px-1 py-0.5">/</kbd>
          </button>

          {/* Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <DevModeToggle />
            {wallet?.connected ? (
              <button onClick={() => { disconnectWallet(); showToast("Disconnected", "info"); }}
                className="hidden md:flex items-center gap-1.5 h-[32px] px-3 rounded-full bg-secondary text-[11px] hover:bg-secondary transition-colors">
                <img src={getAddressAvatar(wallet.address)} alt="" className="h-4 w-4 rounded-sm" />
                <span className="font-mono-data">{wallet.address.slice(0, 6)}..{wallet.address.slice(-4)}</span>
              </button>
            ) : (
              <button onClick={() => setWalletOpen(true)}
                className="hidden md:flex n-btn n-btn--primary n-btn--sm">
                Connect
              </button>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border bg-background animate-fadeIn max-h-[70vh] overflow-y-auto">
            <nav className="px-3 py-2 space-y-0.5">
              {allNavMobile.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${
                    isActive(item.href) ? "text-primary bg-primary/5 font-medium" : "text-muted-foreground hover:bg-secondary"
                  }`}>
                    <Icon className="h-4 w-4" />{item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <ConnectWalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
    </>
  );
}
