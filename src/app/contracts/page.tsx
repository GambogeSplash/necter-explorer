"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileCheck,
  FileCode2,
  ShieldCheck,
  Clock,
  CheckCircle2,
  ChevronDown,
  Search,
} from "lucide-react";
import { showToast } from "@/components/toast";
import { StatCard } from "@/components/stat-card";
import { HashLink } from "@/components/hash-link";
import { TimeAgo } from "@/components/time-ago";
import { Pagination } from "@/components/pagination";
import { MobileCard } from "@/components/mobile-card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/page-title";
import { contractEvents } from "@/lib/mock-data";

// --- Mock data -----------------------------------------------------------

const verifiedContracts = [
  {
    address: "0x7a3B1eF9C2d4A8b0FE6c5D7a9B2C1d3E4f5A6b7C",
    name: "DeviceRegistry",
    compiler: "Solidity 0.8.24",
    optimization: true,
    license: "MIT",
    verifiedAt: "2026-04-05T08:12:00Z",
    standard: "—",
  },
  {
    address: "0x1D2e3F4a5B6c7D8e9F0a1B2c3D4e5F6a7B8c9D0e",
    name: "JobManager",
    compiler: "Solidity 0.8.24",
    optimization: true,
    license: "MIT",
    verifiedAt: "2026-04-04T19:45:00Z",
    standard: "—",
  },
  {
    address: "0x9f8E7d6C5b4A3f2E1d0C9b8A7f6E5d4C3b2A1f0E",
    name: "StakeManager",
    compiler: "Solidity 0.8.22",
    optimization: true,
    license: "GPL-3.0",
    verifiedAt: "2026-04-04T14:30:00Z",
    standard: "ERC-20",
  },
  {
    address: "0x4A5b6C7d8E9f0A1b2C3d4E5f6A7b8C9d0E1f2A3b",
    name: "GovernanceDAO",
    compiler: "Solidity 0.8.24",
    optimization: false,
    license: "MIT",
    verifiedAt: "2026-04-03T22:10:00Z",
    standard: "—",
  },
  {
    address: "0x2C3d4E5f6A7b8C9d0E1f2A3b4C5d6E7f8A9b0C1d",
    name: "TreasuryVault",
    compiler: "Solidity 0.8.22",
    optimization: true,
    license: "Apache-2.0",
    verifiedAt: "2026-04-03T11:05:00Z",
    standard: "—",
  },
  {
    address: "0x8F9a0B1c2D3e4F5a6B7c8D9e0F1a2B3c4D5e6F7a",
    name: "GatewayBatcher",
    compiler: "Solidity 0.8.24",
    optimization: true,
    license: "MIT",
    verifiedAt: "2026-04-02T16:48:00Z",
    standard: "—",
  },
  {
    address: "0x5E6f7A8b9C0d1E2f3A4b5C6d7E8f9A0b1C2d3E4f",
    name: "ProofVerifier",
    compiler: "Solidity 0.8.24",
    optimization: true,
    license: "GPL-3.0",
    verifiedAt: "2026-04-01T09:22:00Z",
    standard: "—",
  },
  {
    address: "0x3A4b5C6d7E8f9A0b1C2d3E4f5A6b7C8d9E0f1A2b",
    name: "TokenVesting",
    compiler: "Solidity 0.8.22",
    optimization: false,
    license: "MIT",
    verifiedAt: "2026-03-30T20:15:00Z",
    standard: "ERC-20",
  },
  {
    address: "0x6B7c8D9e0F1a2B3c4D5e6F7a8B9c0D1e2F3a4B5c",
    name: "RewardDistributor",
    compiler: "Solidity 0.8.24",
    optimization: true,
    license: "Apache-2.0",
    verifiedAt: "2026-03-29T07:33:00Z",
    standard: "—",
  },
  {
    address: "0x0F1a2B3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a",
    name: "BridgeAdapter",
    compiler: "Solidity 0.8.22",
    optimization: true,
    license: "MIT",
    verifiedAt: "2026-03-28T15:01:00Z",
    standard: "—",
  },
];

const compilerVersions = [
  "Solidity 0.8.24",
  "Solidity 0.8.22",
  "Solidity 0.8.20",
  "Solidity 0.8.19",
  "Solidity 0.8.17",
];

const MOCK_ABI = `[
  {
    "inputs": [{"name": "deviceId", "type": "uint256"}],
    "name": "registerDevice",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "deviceId", "type": "uint256"}],
    "name": "getDevice",
    "outputs": [
      {"name": "owner", "type": "address"},
      {"name": "status", "type": "uint8"},
      {"name": "registeredAt", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
]`;

const eventNameColors: Record<string, string> = {
  DeviceRegistered: "bg-[#22C55E]/10 text-[#22C55E]",
  DeviceDeactivated: "bg-[#EB5757]/10 text-[#EB5757]",
  AttestationSubmitted: "bg-[#6E9FFF]/10 text-[#6E9FFF]",
  JobPosted: "bg-[#FFC933]/10 text-[#FFC933]",
  JobAssigned: "bg-[#9985FF]/10 text-[#9985FF]",
  JobCompleted: "bg-[#22C55E]/10 text-[#22C55E]",
  JobDisputed: "bg-[#F2994A]/10 text-[#F2994A]",
  StakeDeposited: "bg-[#6E9FFF]/10 text-[#6E9FFF]",
  StakeWithdrawn: "bg-[#F2994A]/10 text-[#F2994A]",
  SlashApplied: "bg-[#EB5757]/10 text-[#EB5757]",
  RewardClaimed: "bg-[#FFC933]/10 text-[#FFC933]",
};

// --- Page ----------------------------------------------------------------

export default function ContractsPage() {
  const [contractAddress, setContractAddress] = useState("");
  const [compiler, setCompiler] = useState(compilerVersions[0]);
  const [optimizationEnabled, setOptimizationEnabled] = useState(true);
  const [runs, setRuns] = useState("200");
  const [sourceCode, setSourceCode] = useState("");
  const [abiOutput, setAbiOutput] = useState("");
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Search / filter
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filteredContracts = useMemo(() => {
    if (!searchQuery.trim()) return verifiedContracts;
    const q = searchQuery.toLowerCase();
    return verifiedContracts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const totalItems = filteredContracts.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const pagedContracts = filteredContracts.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Reset page when search changes
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleVerify = () => {
    setVerifying(true);
    setVerified(false);
    setAbiOutput("");

    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
      setAbiOutput(MOCK_ABI);
      showToast("Contract verified successfully!", "success");
    }, 1800);
  };

  // Show first 10 contract events
  const recentEvents = contractEvents.slice(0, 10);

  return (
    <div className="px-2.5 py-2 space-y-4">
      <PageTitle title="Contracts" />
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Contract Verification
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Verify and explore smart contracts deployed on Necter
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="Total Contracts"
          value="1,284"
          icon={FileCode2}
          change="+42 this week"
          trend="up"
        />
        <StatCard
          title="Verified"
          value="836"
          icon={ShieldCheck}
          change="65.1%"
          trend="up"
        />
        <StatCard
          title="Verification Rate"
          value="94.2%"
          icon={FileCheck}
          change="+1.3%"
          trend="up"
        />
        <StatCard
          title="Latest Verified"
          value="8m ago"
          icon={Clock}
          trend="neutral"
        />
      </div>

      {/* ---- Section 1: Verified Contracts Table ---- */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            Recently Verified Contracts
          </h2>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter by contract name..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent pl-8 pr-3 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div className="hidden md:block rounded-lg bg-card border border-border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_140px_90px_140px_90px_90px_100px] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
            <span>Contract</span>
            <span>Compiler</span>
            <span>Standard</span>
            <span>Optimization</span>
            <span>License</span>
            <span>Verified</span>
            <span />
          </div>

          {/* Rows */}
          {pagedContracts.map((c) => (
            <Link
              key={c.address}
              href={`/contracts/${c.address}`}
              className="row-hover grid grid-cols-[1fr_140px_90px_140px_90px_90px_100px] gap-3 items-center px-5 py-2.5 border-b border-border last:border-0 text-sm transition-colors"
            >
              {/* Address + Name */}
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-xs font-medium text-foreground truncate">
                  {c.name}
                </span>
                <span className="font-mono-data text-xs text-muted-foreground truncate">
                  {c.address.slice(0, 10)}...{c.address.slice(-8)}
                </span>
              </div>

              {/* Compiler */}
              <span className="font-mono-data text-xs text-muted-foreground">
                {c.compiler}
              </span>

              {/* Standard */}
              <span>
                <span
                  className={`inline-flex px-1.5 py-0.5 rounded-md text-[10px] font-medium ${
                    c.standard === "ERC-20"
                      ? "bg-[#6E9FFF]/10 text-[#6E9FFF]"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {c.standard}
                </span>
              </span>

              {/* Optimization */}
              <span>
                <span
                  className={`inline-flex px-1.5 py-0.5 rounded-md text-[10px] font-medium ${
                    c.optimization
                      ? "bg-[#22C55E]/10 text-[#22C55E]"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {c.optimization ? "Yes" : "No"}
                </span>
              </span>

              {/* License */}
              <span className="text-xs text-muted-foreground">
                {c.license}
              </span>

              {/* Verified date */}
              <TimeAgo timestamp={c.verifiedAt} />

              {/* Verified badge */}
              <span className="flex justify-end">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-[#22C55E]/10 text-[#22C55E]">
                  <ShieldCheck className="h-3 w-3" />
                  Verified
                </span>
              </span>
            </Link>
          ))}
        </div>
        <div className="md:hidden space-y-3">
          {pagedContracts.map((c) => (
            <MobileCard
              key={c.address}
              onClick={() => window.location.href = `/contracts/${c.address}`}
              rows={[
                { label: "Contract", value: <span className="text-xs font-medium">{c.name}</span> },
                { label: "Compiler", value: <span className="font-mono-data text-xs">{c.compiler}</span> },
                { label: "Standard", value: <span className={`inline-flex px-1.5 py-0.5 rounded-md text-[10px] font-medium ${c.standard === "ERC-20" ? "bg-[#6E9FFF]/10 text-[#6E9FFF]" : "bg-muted text-muted-foreground"}`}>{c.standard}</span> },
                { label: "Verified", value: <TimeAgo timestamp={c.verifiedAt} /> },
              ]}
            />
          ))}
        </div>
        <div className="mt-3">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={pageSize}
            totalItems={totalItems}
          />
        </div>
      </div>

      {/* ---- Section 2: Verify Contract Form ---- */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-2">
          Verify & Publish Contract Source Code
        </h2>
        <div className="rounded-lg bg-card border border-border p-6 space-y-5">
          {/* Success banner */}
          {verified && (
            <div className="flex items-center gap-2 rounded-lg border border-[#22C55E]/30 bg-[#22C55E]/10 px-4 py-3">
              <CheckCircle2 className="h-5 w-5 text-[#22C55E] shrink-0" />
              <span className="text-sm font-medium text-[#22C55E]">
                Contract verified successfully!
              </span>
            </div>
          )}

          {/* Row 1: Address + Compiler */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Contract Address
              </label>
              <Input
                placeholder="0x..."
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                className="font-mono-data"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Compiler Version
              </label>
              <div className="relative">
                <select
                  value={compiler}
                  onChange={(e) => setCompiler(e.target.value)}
                  className="h-8 w-full appearance-none rounded-lg border border-input bg-transparent px-3 py-1 pr-8 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                >
                  {compilerVersions.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Row 2: Optimization + Runs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Optimization
              </label>
              <button
                type="button"
                onClick={() => setOptimizationEnabled(!optimizationEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ${
                  optimizationEnabled ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                    optimizationEnabled ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
              <p className="text-[11px] text-muted-foreground">
                {optimizationEnabled ? "Enabled" : "Disabled"}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Runs
              </label>
              <Input
                type="number"
                value={runs}
                onChange={(e) => setRuns(e.target.value)}
                className="font-mono-data w-32"
              />
            </div>
          </div>

          {/* Source code */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Source Code
            </label>
            <Textarea
              placeholder="// SPDX-License-Identifier: MIT&#10;pragma solidity ^0.8.24;&#10;&#10;contract MyContract {&#10;    ...&#10;}"
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              rows={14}
              className="font-mono-data text-xs !min-h-[280px] resize-y"
            />
          </div>

          {/* ABI output */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              ABI Output
            </label>
            <Textarea
              readOnly
              value={abiOutput}
              placeholder="ABI will appear here after verification..."
              rows={8}
              className="font-mono-data text-xs !min-h-[140px] resize-y bg-muted/30"
            />
          </div>

          {/* Verify button */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleVerify}
              disabled={verifying}
              size="lg"
              className="gap-2"
            >
              {verifying ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Verify Contract
                </>
              )}
            </Button>
            {verified && (
              <span className="text-xs text-[#22C55E] font-medium">
                Verification complete
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ---- Section 3: Recent Contract Events ---- */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-2">
          Recent Contract Events
        </h2>
        <div className="hidden md:block rounded-lg bg-card border border-border overflow-hidden">
          <div className="grid grid-cols-[140px_160px_90px_1fr_100px] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
            <span>Contract Name</span>
            <span>Event Name</span>
            <span className="text-right">Block</span>
            <span>Args</span>
            <span className="text-right">Time</span>
          </div>
          {recentEvents.map((evt, i) => (
            <div key={`${evt.address}-${i}`} className="row-hover grid grid-cols-[140px_160px_90px_1fr_100px] gap-3 items-center px-5 py-2.5 border-b border-border last:border-0 text-sm">
              <span className="font-medium text-foreground text-xs">{evt.contractName}</span>
              <span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium w-fit ${eventNameColors[evt.eventName] ?? "bg-muted text-muted-foreground"}`}>
                  {evt.eventName}
                </span>
              </span>
              <span className="text-right font-mono-data text-xs text-muted-foreground">
                {evt.blockNumber.toLocaleString()}
              </span>
              <span className="font-mono-data text-xs text-muted-foreground truncate">
                {evt.args.length > 50 ? `${evt.args.slice(0, 50)}...` : evt.args}
              </span>
              <span className="text-right">
                <TimeAgo timestamp={evt.timestamp} />
              </span>
            </div>
          ))}
        </div>
        <div className="md:hidden space-y-3">
          {recentEvents.map((evt, i) => (
            <MobileCard
              key={`${evt.address}-${i}`}
              rows={[
                { label: "Contract", value: <span className="text-xs font-medium">{evt.contractName}</span> },
                { label: "Event", value: <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${eventNameColors[evt.eventName] ?? "bg-muted text-muted-foreground"}`}>{evt.eventName}</span> },
                { label: "Block", value: <span className="font-mono-data text-xs">{evt.blockNumber.toLocaleString()}</span> },
                { label: "Time", value: <TimeAgo timestamp={evt.timestamp} /> },
              ]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
