"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { HashLink } from "@/components/hash-link";
import { StatusBadge } from "@/components/status-badge";
import { TimeAgo } from "@/components/time-ago";
import { getTokenLogo } from "@/lib/token-logos";
import { getAddressAvatar } from "@/lib/avatar";
import {
  blocks,
  transactions,
  operators,
  devices,
  erc20Tokens,
  proposals,
} from "@/lib/mock-data";

const CONTRACT_LIST = [
  { name: "DeviceRegistry", address: "0x7a3B1eF9C2d4A8b0FE6c5D7a9B2C1d3E4f5A6b7C" },
  { name: "JobManager", address: "0x4c2D8eA1B3f5C7d9E0a2B4c6D8e0A2b4C6d8E0a2" },
  { name: "StakeManager", address: "0x9f1E3a5C7d9B1e3A5c7D9b1E3a5C7d9B1e3A5c7D" },
  { name: "GovernanceDAO", address: "0x2b4D6f8A0c2E4a6B8d0F2a4C6e8A0b2D4f6A8c0E" },
  { name: "TreasuryVault", address: "0x5e7A9c1D3f5B7d9E1a3C5e7A9b1D3f5B7d9E1a3C" },
];

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const q = query.trim();
  const qLower = q.toLowerCase();

  const results = useMemo(() => {
    if (!q) return { blocks: [], transactions: [], addresses: [], operators: [], devices: [], tokens: [], proposals: [], contracts: [] };

    const isNumeric = /^\d+$/.test(q);

    // Blocks: match height
    const matchedBlocks = isNumeric
      ? blocks.filter((b) => b.height.toString().includes(q))
      : blocks.filter((b) => b.hash.toLowerCase().includes(qLower));

    // Transactions: match hash prefix
    const matchedTxs = transactions.filter((tx) =>
      tx.hash.toLowerCase().includes(qLower)
    );

    // Addresses: match from/to in transactions
    const addressSet = new Set<string>();
    transactions.forEach((tx) => {
      if (tx.from.toLowerCase().includes(qLower)) addressSet.add(tx.from);
      if (tx.to.toLowerCase().includes(qLower)) addressSet.add(tx.to);
    });
    const matchedAddresses = Array.from(addressSet);

    // Operators: match operatorId or address
    const matchedOperators = operators.filter(
      (op) =>
        op.operatorId.toLowerCase().includes(qLower) ||
        op.address.toLowerCase().includes(qLower)
    );

    // Devices: match deviceId
    const matchedDevices = devices.filter((d) =>
      d.deviceId.toLowerCase().includes(qLower)
    );

    // Tokens: match name or symbol (case insensitive)
    const matchedTokens = erc20Tokens.filter(
      (t) =>
        t.name.toLowerCase().includes(qLower) ||
        t.symbol.toLowerCase().includes(qLower)
    );

    // Proposals: match title (case insensitive contains)
    const matchedProposals = proposals.filter((p) =>
      p.title.toLowerCase().includes(qLower) ||
      p.proposalId.toLowerCase().includes(qLower)
    );

    // Contracts: match name
    const matchedContracts = CONTRACT_LIST.filter((c) =>
      c.name.toLowerCase().includes(qLower)
    );

    return {
      blocks: matchedBlocks,
      transactions: matchedTxs,
      addresses: matchedAddresses,
      operators: matchedOperators,
      devices: matchedDevices,
      tokens: matchedTokens,
      proposals: matchedProposals,
      contracts: matchedContracts,
    };
  }, [q, qLower]);

  const totalResults =
    results.blocks.length +
    results.transactions.length +
    results.addresses.length +
    results.operators.length +
    results.devices.length +
    results.tokens.length +
    results.proposals.length +
    results.contracts.length;

  const categoryCount = [
    results.blocks.length,
    results.transactions.length,
    results.addresses.length,
    results.operators.length,
    results.devices.length,
    results.tokens.length,
    results.proposals.length,
    results.contracts.length,
  ].filter((n) => n > 0).length;

  return (
    <div className="px-2.5 py-2 space-y-4">
      <PageTitle title="Search Results" />

      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-secondary p-2">
            <Search className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Search Results</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Results for &ldquo;{q}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Results count */}
      {totalResults > 0 && (
        <p className="text-sm text-muted-foreground">
          Found {totalResults} result{totalResults !== 1 ? "s" : ""} across {categoryCount} categor{categoryCount !== 1 ? "ies" : "y"}
        </p>
      )}

      {/* Empty state */}
      {totalResults === 0 && q && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Image
            src="/brand/bee.png"
            alt=""
            width={80}
            height={80}
            className="opacity-40 mb-4"
          />
          <p className="text-muted-foreground text-sm">
            No results found for &ldquo;{q}&rdquo;
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Try searching by block number, transaction hash, address, token name, or device ID.
          </p>
        </div>
      )}

      {/* Blocks */}
      {results.blocks.length > 0 && (
        <div className="rounded-lg border border-border bg-card">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-semibold">Blocks ({results.blocks.length})</h2>
          </div>
          <div className="divide-y divide-border">
            {results.blocks.map((block) => (
              <Link
                key={block.height}
                href={`/blocks/${block.height}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono-data text-sm font-medium">#{block.height.toLocaleString()}</span>
                  <span className="font-mono-data text-xs text-muted-foreground hidden sm:inline">
                    {block.hash.slice(0, 16)}...
                  </span>
                </div>
                <TimeAgo timestamp={block.timestamp} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Transactions */}
      {results.transactions.length > 0 && (
        <div className="rounded-lg border border-border bg-card">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-semibold">Transactions ({results.transactions.length})</h2>
          </div>
          <div className="divide-y divide-border">
            {results.transactions.map((tx) => (
              <Link
                key={tx.hash}
                href={`/tx/${tx.hash}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-4">
                  <HashLink hash={tx.hash} type="tx" />
                  <StatusBadge status={tx.type.replace("_", " ")} />
                </div>
                <span className="font-mono-data text-sm">{tx.value} NECTA</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Addresses */}
      {results.addresses.length > 0 && (
        <div className="rounded-lg border border-border bg-card">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-semibold">Addresses ({results.addresses.length})</h2>
          </div>
          <div className="divide-y divide-border">
            {results.addresses.map((addr) => (
              <Link
                key={addr}
                href={`/address/${addr}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-secondary transition-colors"
              >
                <img src={getAddressAvatar(addr)} alt="" className="h-6 w-6 rounded-sm" />
                <span className="font-mono-data text-sm">{addr}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Operators */}
      {results.operators.length > 0 && (
        <div className="rounded-lg border border-border bg-card">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-semibold">Operators ({results.operators.length})</h2>
          </div>
          <div className="divide-y divide-border">
            {results.operators.map((op) => (
              <Link
                key={op.operatorId}
                href={`/depin/operator/${op.operatorId}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono-data text-sm font-medium">{op.operatorId}</span>
                  <span className="font-mono-data text-xs text-muted-foreground hidden sm:inline">
                    {op.address.slice(0, 12)}...
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">Rep: {op.reputation}</span>
                  <StatusBadge status={op.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Devices */}
      {results.devices.length > 0 && (
        <div className="rounded-lg border border-border bg-card">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-semibold">Devices ({results.devices.length})</h2>
          </div>
          <div className="divide-y divide-border">
            {results.devices.map((dev) => (
              <Link
                key={dev.deviceId}
                href={`/depin/device/${dev.deviceId}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-secondary transition-colors"
              >
                <span className="font-mono-data text-sm font-medium">{dev.deviceId}</span>
                <StatusBadge status={dev.status} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tokens */}
      {results.tokens.length > 0 && (
        <div className="rounded-lg border border-border bg-card">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-semibold">Tokens ({results.tokens.length})</h2>
          </div>
          <div className="divide-y divide-border">
            {results.tokens.map((token) => (
              <Link
                key={token.symbol}
                href={`/tokens/${token.symbol}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img src={getTokenLogo(token.symbol)} alt={token.symbol} className="h-6 w-6 rounded-full" />
                  <span className="text-sm font-medium">{token.name}</span>
                  <span className="text-xs text-muted-foreground">{token.symbol}</span>
                </div>
                <span className="font-mono-data text-sm">${token.price}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Proposals */}
      {results.proposals.length > 0 && (
        <div className="rounded-lg border border-border bg-card">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-semibold">Proposals ({results.proposals.length})</h2>
          </div>
          <div className="divide-y divide-border">
            {results.proposals.map((p) => (
              <Link
                key={p.proposalId}
                href={`/governance/${p.proposalId}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono-data text-sm font-medium">{p.proposalId}</span>
                  <span className="text-sm">{p.title}</span>
                </div>
                <StatusBadge status={p.status} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Contracts */}
      {results.contracts.length > 0 && (
        <div className="rounded-lg border border-border bg-card">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-semibold">Contracts ({results.contracts.length})</h2>
          </div>
          <div className="divide-y divide-border">
            {results.contracts.map((c) => (
              <Link
                key={c.name}
                href="/contracts"
                className="flex items-center justify-between px-5 py-3 hover:bg-secondary transition-colors"
              >
                <span className="text-sm font-medium">{c.name}</span>
                <span className="font-mono-data text-xs text-muted-foreground">
                  {c.address.slice(0, 16)}...
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="px-2.5 py-4"><p className="text-muted-foreground text-sm">Loading search results...</p></div>}>
      <SearchResults />
    </Suspense>
  );
}
