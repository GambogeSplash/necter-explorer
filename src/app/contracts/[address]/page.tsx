"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Activity, Users } from "lucide-react";
import { HashLink } from "@/components/hash-link";
import { StatusBadge } from "@/components/status-badge";
import { TimeAgo } from "@/components/time-ago";
import { StatCard } from "@/components/stat-card";
import { Pagination } from "@/components/pagination";
import { MobileCard } from "@/components/mobile-card";
import { contractEvents } from "@/lib/mock-data";

// ─── Mock Contract Data ─────────────────────────────────────────────────────

const contracts = [
  {
    address: "0x7a3B1eF9C2d4A8b0FE6c5D7a9B2C1d3E4f5A6b7C",
    name: "DeviceRegistry",
    compiler: "Solidity 0.8.24",
    optimization: true,
    runs: 200,
    license: "MIT",
    standard: "\u2014",
    verifiedAt: "2026-04-05T08:12:00Z",
    totalCalls: 142_847,
    eventsEmitted: 34_521,
    gasUsed: "847.2M",
    uniqueCallers: 12_487,
    isProxy: false,
  },
  {
    address: "0x1D2e3F4a5B6c7D8e9F0a1B2c3D4e5F6a7B8c9D0e",
    name: "JobManager",
    compiler: "Solidity 0.8.24",
    optimization: true,
    runs: 200,
    license: "MIT",
    standard: "\u2014",
    verifiedAt: "2026-04-04T19:45:00Z",
    totalCalls: 89_432,
    eventsEmitted: 18_247,
    gasUsed: "523.1M",
    uniqueCallers: 7_842,
    isProxy: false,
  },
  {
    address: "0x9f8E7d6C5b4A3f2E1d0C9b8A7f6E5d4C3b2A1f0E",
    name: "StakeManager",
    compiler: "Solidity 0.8.22",
    optimization: true,
    runs: 200,
    license: "GPL-3.0",
    standard: "ERC-20",
    verifiedAt: "2026-04-04T14:30:00Z",
    totalCalls: 67_891,
    eventsEmitted: 12_847,
    gasUsed: "412.8M",
    uniqueCallers: 5_421,
    isProxy: false,
  },
  {
    address: "0x4A5b6C7d8E9f0A1b2C3d4E5f6A7b8C9d0E1f2A3b",
    name: "GovernanceDAO",
    compiler: "Solidity 0.8.24",
    optimization: false,
    runs: 0,
    license: "MIT",
    standard: "\u2014",
    verifiedAt: "2026-04-03T22:10:00Z",
    totalCalls: 34_218,
    eventsEmitted: 8_412,
    gasUsed: "287.4M",
    uniqueCallers: 2_847,
    isProxy: false,
  },
  {
    address: "0x2C3d4E5f6A7b8C9d0E1f2A3b4C5d6E7f8A9b0C1d",
    name: "TreasuryVault",
    compiler: "Solidity 0.8.22",
    optimization: true,
    runs: 200,
    license: "Apache-2.0",
    standard: "\u2014",
    verifiedAt: "2026-04-03T11:05:00Z",
    totalCalls: 12_487,
    eventsEmitted: 4_521,
    gasUsed: "156.2M",
    uniqueCallers: 1_247,
    isProxy: false,
  },
  {
    address: "0x8F9a0B1c2D3e4F5a6B7c8D9e0F1a2B3c4D5e6F7a",
    name: "GatewayBatcher",
    compiler: "Solidity 0.8.24",
    optimization: true,
    runs: 200,
    license: "MIT",
    standard: "\u2014",
    verifiedAt: "2026-04-02T16:48:00Z",
    totalCalls: 98_124,
    eventsEmitted: 24_891,
    gasUsed: "612.7M",
    uniqueCallers: 8_912,
    isProxy: false,
  },
  {
    address: "0x5E6f7A8b9C0d1E2f3A4b5C6d7E8f9A0b1C2d3E4f",
    name: "ProofVerifier",
    compiler: "Solidity 0.8.24",
    optimization: true,
    runs: 200,
    license: "GPL-3.0",
    standard: "\u2014",
    verifiedAt: "2026-04-01T09:22:00Z",
    totalCalls: 45_678,
    eventsEmitted: 9_847,
    gasUsed: "324.1M",
    uniqueCallers: 3_412,
    isProxy: false,
  },
  {
    address: "0x3A4b5C6d7E8f9A0b1C2d3E4f5A6b7C8d9E0f1A2b",
    name: "TokenVesting",
    compiler: "Solidity 0.8.22",
    optimization: false,
    runs: 0,
    license: "MIT",
    standard: "ERC-20",
    verifiedAt: "2026-03-30T20:15:00Z",
    totalCalls: 8_912,
    eventsEmitted: 2_487,
    gasUsed: "89.4M",
    uniqueCallers: 847,
    isProxy: false,
  },
  {
    address: "0x6B7c8D9e0F1a2B3c4D5e6F7a8B9c0D1e2F3a4B5c",
    name: "RewardDistributor",
    compiler: "Solidity 0.8.24",
    optimization: true,
    runs: 200,
    license: "Apache-2.0",
    standard: "\u2014",
    verifiedAt: "2026-03-29T07:33:00Z",
    totalCalls: 56_241,
    eventsEmitted: 14_218,
    gasUsed: "398.6M",
    uniqueCallers: 4_891,
    isProxy: false,
  },
  {
    address: "0x0F1a2B3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a",
    name: "BridgeAdapter",
    compiler: "Solidity 0.8.22",
    optimization: true,
    runs: 200,
    license: "MIT",
    standard: "\u2014",
    verifiedAt: "2026-03-28T15:01:00Z",
    totalCalls: 23_847,
    eventsEmitted: 6_412,
    gasUsed: "178.3M",
    uniqueCallers: 2_124,
    isProxy: true,
    implementation: "0xA1b2C3d4E5f6A7b8C9d0E1f2A3b4C5d6E7f8A9b0",
  },
];

// Read function mock results per contract
const readFunctions: Record<string, { name: string; signature: string; returnType: string; result: string; hasInput?: boolean; inputLabel?: string }[]> = {
  DeviceRegistry: [
    { name: "name", signature: "name() → string", returnType: "string", result: "DeviceRegistry" },
    { name: "totalDevices", signature: "totalDevices() → uint256", returnType: "uint256", result: "34,521" },
    { name: "getDevice", signature: "getDevice(uint256 deviceId) → Device", returnType: "Device", result: '{ id: 1042, owner: "0x7a3B...6b7C", fingerprint: "0xd1e2f3...", stakedAmount: 5000, active: true }', hasInput: true, inputLabel: "deviceId (uint256)" },
    { name: "owner", signature: "owner() → address", returnType: "address", result: "0x7a1bC3d4E5f6A7b8C9d0E1f2A3b4C5d6E7f8A9b0" },
  ],
  JobManager: [
    { name: "name", signature: "name() → string", returnType: "string", result: "JobManager" },
    { name: "totalJobs", signature: "totalJobs() → uint256", returnType: "uint256", result: "1,284" },
    { name: "getJob", signature: "getJob(uint256 jobId) → Job", returnType: "Job", result: '{ id: 5001, poster: "0x2a3b...D2e3", status: 2, reward: 1500 }', hasInput: true, inputLabel: "jobId (uint256)" },
    { name: "owner", signature: "owner() → address", returnType: "address", result: "0x5e6fB8c9D0e1F2a3B4c5D6e7F8a9B0c1D2e3F4a5" },
  ],
};

// Source code stubs per contract
const sourceCodeStubs: Record<string, string> = {
  DeviceRegistry: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DeviceRegistry {
    struct Device {
        uint256 id;
        address owner;
        bytes32 fingerprint;
        uint256 stakedAmount;
        bool active;
    }

    mapping(uint256 => Device) public devices;
    uint256 public totalDevices;

    event DeviceRegistered(uint256 indexed id, address indexed owner);
    event DeviceSlashed(uint256 indexed id, uint256 penalty);

    function registerDevice(bytes32 _fingerprint) external payable { ... }
    function getDevice(uint256 _id) external view returns (Device memory) { ... }
    function deactivateDevice(uint256 _id) external { ... }
    function slashDevice(uint256 _id, uint256 _penalty) external { ... }
}`,
  JobManager: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract JobManager {
    struct Job {
        uint256 id;
        address poster;
        address worker;
        uint8 status;
        uint256 reward;
        bytes32 proofHash;
    }

    mapping(uint256 => Job) public jobs;
    uint256 public totalJobs;

    event JobPosted(uint256 indexed id, address indexed poster, uint256 reward);
    event JobAssigned(uint256 indexed id, address indexed worker);
    event JobCompleted(uint256 indexed id, bytes32 proofHash);
    event JobDisputed(uint256 indexed id, address disputer);

    function postJob(uint256 _reward) external payable returns (uint256) { ... }
    function assignJob(uint256 _id, address _worker) external { ... }
    function completeJob(uint256 _id, bytes32 _proofHash) external { ... }
}`,
  StakeManager: `// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract StakeManager {
    IERC20 public stakingToken;
    mapping(address => uint256) public stakes;
    uint256 public totalStaked;

    event StakeDeposited(address indexed staker, uint256 amount);
    event StakeWithdrawn(address indexed staker, uint256 amount);
    event SlashApplied(address indexed staker, uint256 penalty);
    event RewardClaimed(address indexed staker, uint256 reward);

    function deposit(uint256 _amount) external { ... }
    function withdraw(uint256 _amount) external { ... }
    function slash(address _staker, uint256 _penalty) external { ... }
    function claimReward() external { ... }
}`,
};

const eventNameColors: Record<string, string> = {
  DeviceRegistered: "bg-[#22C55E]/10 text-[#22C55E]",
  DeviceDeactivated: "bg-[#EB5757]/10 text-[#EB5757]",
  AttestationSubmitted: "bg-[#6E9FFF]/10 text-[#6E9FFF]",
  JobPosted: "bg-[#FFC933]/10 text-[#FFC933]",
  JobAssigned: "bg-[#6E9FFF]/10 text-[#6E9FFF]",
  JobCompleted: "bg-[#22C55E]/10 text-[#22C55E]",
  JobDisputed: "bg-[#EB5757]/10 text-[#EB5757]",
  StakeDeposited: "bg-[#6E9FFF]/10 text-[#6E9FFF]",
  StakeWithdrawn: "bg-[#EB5757]/10 text-[#EB5757]",
  SlashApplied: "bg-[#EB5757]/10 text-[#EB5757]",
  RewardClaimed: "bg-[#FFC933]/10 text-[#FFC933]",
};

type TabId = "overview" | "read" | "events" | "source";

const solKeywords = new Set([
  "contract", "struct", "mapping", "uint256", "uint8", "address", "bytes32",
  "bool", "event", "function", "external", "public", "view", "returns",
  "payable", "indexed", "memory", "import", "pragma", "solidity",
]);

// ─── Component ──────────────────────────────────────────────────────────────

export default function ContractDetailPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = use(params);
  const [tab, setTab] = useState<TabId>("overview");
  const [eventsPage, setEventsPage] = useState(1);
  const [expandedFn, setExpandedFn] = useState<Record<string, boolean>>({});
  const [queryInputs, setQueryInputs] = useState<Record<string, string>>({});
  const [queryResults, setQueryResults] = useState<Record<string, boolean>>({});
  const pageSize = 5;

  const contract = contracts.find((c) => c.address === address);

  if (!contract) {
    return (
      <div className="px-2.5 py-4">
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <h1 className="text-lg font-semibold mb-1">Contract Not Found</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Contract {address.slice(0, 10)}... does not exist.
          </p>
          <Link
            href="/contracts"
            className="text-sm text-primary hover:underline"
          >
            Back to Contracts
          </Link>
        </div>
      </div>
    );
  }

  const filteredEvents = contractEvents.filter(
    (e) => e.contractName === contract.name
  );
  const eventsTotalPages = Math.ceil(filteredEvents.length / pageSize);
  const pagedEvents = filteredEvents.slice(
    (eventsPage - 1) * pageSize,
    eventsPage * pageSize
  );

  const fns = readFunctions[contract.name] ?? readFunctions.DeviceRegistry!;
  const sourceCode = sourceCodeStubs[contract.name] ?? sourceCodeStubs.DeviceRegistry!;
  const sourceLines = sourceCode.split("\n");

  const toggleFn = (name: string) => {
    setExpandedFn((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleQuery = (name: string) => {
    setQueryResults((prev) => ({ ...prev, [name]: true }));
  };

  return (
    <div className="max-w-[1480px] mx-auto px-2.5 py-2 space-y-4">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">
              {contract.name}
            </h1>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-[#22C55E]/10 text-[#22C55E]">
              <ShieldCheck className="h-3 w-3" />
              Verified
            </span>
          </div>
          <HashLink hash={contract.address} type="address" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Total Calls" value={contract.totalCalls.toLocaleString()} icon={Activity} />
        <StatCard title="Events Emitted" value={contract.eventsEmitted.toLocaleString()} icon={Activity} />
        <StatCard title="Gas Used" value={contract.gasUsed} icon={Activity} />
        <StatCard title="Unique Callers" value={contract.uniqueCallers.toLocaleString()} icon={Users} />
      </div>

      {/* Tab Switcher */}
      <div className="n-tabbar">
        {(["overview", "read", "events", "source"] as TabId[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`n-tabbar-btn ${tab === t ? "n-tabbar-btn--active" : ""}`}
          >
            {t === "read" ? "Read Contract" : t === "source" ? "Source Code" : t}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="animate-fadeIn space-y-4">
          <div className="rounded-lg bg-card border border-border p-5">
            <h2 className="text-sm font-medium mb-4">Contract Details</h2>
            <div className="space-y-2.5">
              {[
                { label: "Name", value: contract.name },
                { label: "Compiler", value: contract.compiler },
                { label: "Optimization", value: contract.optimization ? `Yes (${contract.runs} runs)` : "No" },
                { label: "License", value: contract.license },
                { label: "Standard", value: contract.standard },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-mono-data text-xs">{row.value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Address</span>
                <HashLink hash={contract.address} type="address" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Verified</span>
                <TimeAgo timestamp={contract.verifiedAt} />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-card border border-border p-5">
            <h2 className="text-sm font-medium mb-2">Proxy Detection</h2>
            {contract.isProxy ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#EB5757]">This contract is a proxy</span>
                <span className="text-muted-foreground">&rarr; Implementation:</span>
                <HashLink hash={(contract as { implementation?: string }).implementation ?? ""} type="address" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                This contract is NOT a proxy.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Read Contract Tab */}
      {tab === "read" && (
        <div className="animate-fadeIn space-y-3">
          {fns.map((fn) => {
            const isExpanded = expandedFn[fn.name] !== false; // default expanded
            const hasQueried = queryResults[fn.name] ?? false;

            return (
              <div key={fn.name} className="rounded-lg bg-card border border-border overflow-hidden">
                <button
                  onClick={() => toggleFn(fn.name)}
                  className="w-full flex items-center justify-between px-5 py-3 hover:bg-secondary transition-colors text-left"
                >
                  <span className="font-mono-data text-sm">{fn.signature}</span>
                  <span className="text-xs text-muted-foreground">
                    {isExpanded ? "\u25B2" : "\u25BC"}
                  </span>
                </button>
                {isExpanded && (
                  <div className="px-5 pb-4 space-y-3 border-t border-border pt-3">
                    <div className="text-xs text-muted-foreground">
                      Returns: <span className="font-mono-data">{fn.returnType}</span>
                    </div>

                    {fn.hasInput && (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder={fn.inputLabel}
                          value={queryInputs[fn.name] ?? ""}
                          onChange={(e) =>
                            setQueryInputs((prev) => ({
                              ...prev,
                              [fn.name]: e.target.value,
                            }))
                          }
                          className="h-8 flex-1 rounded-lg border border-input bg-transparent px-3 text-sm font-mono-data transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 placeholder:text-muted-foreground"
                        />
                        <button
                          onClick={() => handleQuery(fn.name)}
                          className="n-btn n-btn--primary n-btn--sm"
                        >
                          Query
                        </button>
                      </div>
                    )}

                    {(!fn.hasInput || hasQueried) && (
                      <div className="rounded-md border border-border bg-secondary p-3">
                        <span className="font-mono-data text-xs text-foreground">
                          {fn.name === "owner" ? (
                            <HashLink hash={fn.result} type="address" />
                          ) : (
                            fn.result
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Events Tab */}
      {tab === "events" && (
        <div className="animate-fadeIn space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="rounded-lg bg-card border border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">No events found for this contract.</p>
            </div>
          ) : (
            <>
              <div className="hidden md:block rounded-lg bg-card border border-border overflow-hidden">
                <div className="grid grid-cols-[160px_90px_1fr_100px] gap-4 px-5 py-2.5 bg-secondary text-xs text-muted-foreground border-b border-border">
                  <span>Event Name</span>
                  <span className="text-right">Block</span>
                  <span>Args</span>
                  <span className="text-right">Time</span>
                </div>
                {pagedEvents.map((evt, i) => (
                  <div
                    key={`${evt.address}-${i}`}
                    className="row-hover grid grid-cols-[160px_90px_1fr_100px] gap-4 items-center px-5 py-2.5 border-b border-border last:border-0"
                  >
                    <span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium w-fit ${
                          eventNameColors[evt.eventName] ?? "bg-muted text-muted-foreground"
                        }`}
                      >
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
                {pagedEvents.map((evt, i) => (
                  <MobileCard
                    key={`${evt.address}-${i}`}
                    rows={[
                      {
                        label: "Event",
                        value: (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${
                              eventNameColors[evt.eventName] ?? "bg-muted text-muted-foreground"
                            }`}
                          >
                            {evt.eventName}
                          </span>
                        ),
                      },
                      { label: "Block", value: <span className="font-mono-data text-xs">{evt.blockNumber.toLocaleString()}</span> },
                      { label: "Time", value: <TimeAgo timestamp={evt.timestamp} /> },
                    ]}
                  />
                ))}
              </div>
              {eventsTotalPages > 1 && (
                <Pagination
                  currentPage={eventsPage}
                  totalPages={eventsTotalPages}
                  onPageChange={setEventsPage}
                  pageSize={pageSize}
                  totalItems={filteredEvents.length}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Source Code Tab */}
      {tab === "source" && (
        <div className="animate-fadeIn">
          <div className="rounded-lg bg-card border border-border overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-medium">Source Code</h2>
              <span className="text-xs text-muted-foreground font-mono-data">
                {contract.compiler}
              </span>
            </div>
            <div className="overflow-x-auto">
              <pre className="p-5 text-xs leading-relaxed font-mono-data">
                <code>
                  {sourceLines.map((line, i) => (
                    <span key={i} className="flex">
                      <span className="inline-block w-8 text-right pr-4 text-muted-foreground select-none shrink-0">
                        {i + 1}
                      </span>
                      <span>
                        {line.trimStart().startsWith("//") ? (
                          <span className="text-muted-foreground">{line}</span>
                        ) : (
                          line.split(/(\b\w+\b)/g).map((token, tIdx) =>
                            solKeywords.has(token) ? (
                              <span key={tIdx} className="text-[#FFC933]">
                                {token}
                              </span>
                            ) : (
                              <span key={tIdx}>{token}</span>
                            )
                          )
                        )}
                      </span>
                    </span>
                  ))}
                </code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
