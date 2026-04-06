"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Box,
  ArrowLeftRight,
  Wallet,
  Cpu,
  Radio,
  Bot,
  BarChart3,
  FileCode,
  Coins,
  Vote,
  Clock,
  TrendingUp,
  X,
  Search,
} from "lucide-react";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RECENT_SEARCHES_KEY = "necter_recent_searches";
const MAX_RECENT = 5;

const CONTRACT_NAMES = [
  "DeviceRegistry",
  "JobManager",
  "StakeManager",
  "GovernanceDAO",
  "TreasuryVault",
  "GatewayBatcher",
  "ProofVerifier",
  "TokenVesting",
] as const;

const TOKEN_NAMES = ["NECTA", "wETH", "USDC", "DAI", "HIVE"] as const;

const PROPOSALS = [
  { id: "NCP-42", title: "Increase base miner rewards by 15%" },
  { id: "NCP-38", title: "Adopt Celestia DA for blob posting" },
  { id: "NCP-35", title: "Implement progressive slashing penalties" },
  { id: "NCP-31", title: "Fund gateway infrastructure expansion" },
  { id: "NCP-29", title: "Community reward pool rebalancing" },
] as const;

const TRENDING_SEARCHES = [
  "Block #2,400,312",
  "DeviceRegistry",
  "NCP-42",
  "NECTA price",
  "Top operators",
];

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  if (typeof window === "undefined") return;
  try {
    const recent = getRecentSearches().filter((s) => s !== query);
    recent.unshift(query);
    localStorage.setItem(
      RECENT_SEARCHES_KEY,
      JSON.stringify(recent.slice(0, MAX_RECENT))
    );
  } catch {
    // ignore
  }
}

function clearRecentSearches() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // ignore
  }
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setRecentSearches(getRecentSearches());
    }
  }, [open]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const navigate = useCallback(
    (path: string, searchQuery?: string) => {
      if (searchQuery) {
        saveRecentSearch(searchQuery);
      }
      onOpenChange(false);
      router.push(path);
    },
    [onOpenChange, router]
  );

  const handleClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  const q = query.trim();
  const qLower = q.toLowerCase();

  // Existing type detection
  const isBlockNumber = /^\d+$/.test(q) && q.length > 0;
  const isHash = q.startsWith("0x") && q.length > 10;
  const isDevice = q.toUpperCase().startsWith("DEV-");
  const isOperator = q.toUpperCase().startsWith("OP-");
  const isGateway = q.toUpperCase().startsWith("GW-");
  const isJob = q.toUpperCase().startsWith("JOB-");
  const isNCP = q.toUpperCase().startsWith("NCP-");

  // Fuzzy name matching
  const matchedContracts = useMemo(
    () =>
      q.length >= 2
        ? CONTRACT_NAMES.filter((name) =>
            name.toLowerCase().includes(qLower)
          )
        : [],
    [q, qLower]
  );

  const matchedTokens = useMemo(
    () =>
      q.length >= 2
        ? TOKEN_NAMES.filter((name) =>
            name.toLowerCase().includes(qLower)
          )
        : [],
    [q, qLower]
  );

  const matchedProposals = useMemo(() => {
    if (q.length < 3) return [];
    const keywords = qLower.split(/\s+/);
    return PROPOSALS.filter((p) => {
      const titleLower = p.title.toLowerCase();
      const idLower = p.id.toLowerCase();
      return keywords.some(
        (kw) => titleLower.includes(kw) || idLower.includes(kw)
      );
    });
  }, [q, qLower]);

  const hasBlockResults = isBlockNumber;
  const hasTxResults = isHash;
  const hasAddressResults = isHash;
  const hasDePINResults = isDevice || isOperator || isGateway || isJob;
  const hasContractResults = matchedContracts.length > 0;
  const hasGovernanceResults = matchedProposals.length > 0 || isNCP;
  const hasTokenResults = matchedTokens.length > 0;
  const hasAnyResults =
    hasBlockResults ||
    hasTxResults ||
    hasAddressResults ||
    hasDePINResults ||
    hasContractResults ||
    hasGovernanceResults ||
    hasTokenResults;

  const showEmpty = q.length === 0;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && q.length > 0) {
        // If no specific command item is selected, navigate to search all
        const selected = document.querySelector("[cmdk-item][data-selected=true]");
        if (!selected) {
          e.preventDefault();
          navigate(`/search?q=${encodeURIComponent(q)}`, q);
        }
      }
    },
    [q, navigate]
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search by address, tx hash, block, device, contract, token..."
        value={query}
        onValueChange={setQuery}
        onKeyDown={handleKeyDown}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Recent Searches - show when query is empty */}
        {showEmpty && recentSearches.length > 0 && (
          <CommandGroup
            heading={
              <span className="flex items-center justify-between w-full">
                <span>Recent Searches</span>
                <button
                  onClick={handleClearRecent}
                  className="text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Clear
                </button>
              </span>
            }
          >
            {recentSearches.map((search) => (
              <CommandItem
                key={search}
                onSelect={() => setQuery(search)}
              >
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                {search}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Trending Searches - show when query is empty */}
        {showEmpty && (
          <>
            {recentSearches.length > 0 && <CommandSeparator />}
            <CommandGroup heading="Trending">
              {TRENDING_SEARCHES.map((trend) => (
                <CommandItem
                  key={trend}
                  onSelect={() => setQuery(trend)}
                >
                  <TrendingUp className="mr-2 h-4 w-4 text-muted-foreground" />
                  {trend}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Categorized search results */}
        {hasBlockResults && (
          <CommandGroup heading="Blocks">
            <CommandItem onSelect={() => navigate(`/blocks/${q}`, q)}>
              <Box className="mr-2 h-4 w-4" />
              Go to Block #{Number(q).toLocaleString()}
            </CommandItem>
          </CommandGroup>
        )}

        {hasTxResults && (
          <CommandGroup heading="Transactions">
            <CommandItem onSelect={() => navigate(`/tx/${q}`, q)}>
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              View Transaction {q.slice(0, 10)}...{q.slice(-6)}
            </CommandItem>
          </CommandGroup>
        )}

        {hasAddressResults && (
          <CommandGroup heading="Addresses">
            <CommandItem onSelect={() => navigate(`/address/${q}`, q)}>
              <Wallet className="mr-2 h-4 w-4" />
              View Address {q.slice(0, 10)}...{q.slice(-6)}
            </CommandItem>
          </CommandGroup>
        )}

        {hasDePINResults && (
          <CommandGroup heading="DePIN">
            {isDevice && (
              <CommandItem
                onSelect={() =>
                  navigate(
                    `/depin/device/${q.toUpperCase()}`,
                    q
                  )
                }
              >
                <Cpu className="mr-2 h-4 w-4" />
                View Device {q.toUpperCase()}
              </CommandItem>
            )}
            {isOperator && (
              <CommandItem
                onSelect={() =>
                  navigate(
                    `/depin/operator/${q.toUpperCase()}`,
                    q
                  )
                }
              >
                <Radio className="mr-2 h-4 w-4" />
                View Operator {q.toUpperCase()}
              </CommandItem>
            )}
            {isGateway && (
              <CommandItem
                onSelect={() =>
                  navigate(
                    `/iot/gateway/${q.toUpperCase()}`,
                    q
                  )
                }
              >
                <Radio className="mr-2 h-4 w-4" />
                View Gateway {q.toUpperCase()}
              </CommandItem>
            )}
            {isJob && (
              <CommandItem
                onSelect={() =>
                  navigate(
                    `/ai-compute/${q.toUpperCase()}`,
                    q
                  )
                }
              >
                <Bot className="mr-2 h-4 w-4" />
                View AI Job {q.toUpperCase()}
              </CommandItem>
            )}
          </CommandGroup>
        )}

        {hasContractResults && (
          <CommandGroup heading="Contracts">
            {matchedContracts.map((name) => (
              <CommandItem
                key={name}
                onSelect={() => navigate(`/contracts`, name)}
              >
                <FileCode className="mr-2 h-4 w-4" />
                View Contract: {name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {hasTokenResults && (
          <CommandGroup heading="Tokens">
            {matchedTokens.map((name) => (
              <CommandItem
                key={name}
                onSelect={() => navigate(`/tokens`, name)}
              >
                <Coins className="mr-2 h-4 w-4" />
                View Token: {name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {hasGovernanceResults && (
          <CommandGroup heading="Governance">
            {isNCP && (
              <CommandItem
                onSelect={() =>
                  navigate(
                    `/governance/${q.toUpperCase()}`,
                    q
                  )
                }
              >
                <Vote className="mr-2 h-4 w-4" />
                View Proposal {q.toUpperCase()}
              </CommandItem>
            )}
            {matchedProposals.map((proposal) => (
              <CommandItem
                key={proposal.id}
                onSelect={() =>
                  navigate(
                    `/governance/${proposal.id}`,
                    proposal.title
                  )
                }
              >
                <Vote className="mr-2 h-4 w-4" />
                {proposal.id}: {proposal.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Search all results */}
        {q.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Search">
              <CommandItem onSelect={() => navigate(`/search?q=${encodeURIComponent(q)}`, q)}>
                <Search className="mr-2 h-4 w-4" />
                Search all results for &ldquo;{q}&rdquo;
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {/* Quick Navigation - always show */}
        {(showEmpty || hasAnyResults) && <CommandSeparator />}
        <CommandGroup heading="Quick Navigation">
          <CommandItem onSelect={() => navigate("/blocks")}>
            <Box className="mr-2 h-4 w-4" />
            View All Blocks
          </CommandItem>
          <CommandItem onSelect={() => navigate("/transactions")}>
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            View All Transactions
          </CommandItem>
          <CommandItem onSelect={() => navigate("/depin")}>
            <Cpu className="mr-2 h-4 w-4" />
            DePIN Devices & Operators
          </CommandItem>
          <CommandItem onSelect={() => navigate("/ai-compute")}>
            <Bot className="mr-2 h-4 w-4" />
            AI Compute Jobs
          </CommandItem>
          <CommandItem onSelect={() => navigate("/analytics")}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Network Analytics
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
