// ─── Types ───────────────────────────────────────────────────────────────────

export interface Block {
  height: number;
  hash: string;
  parentHash: string;
  timestamp: string;
  proposer: string;
  txCount: number;
  gasUsed: number;
  gasLimit: number;
  zkProofAnchor: string;
}

export interface Transaction {
  hash: string;
  blockNumber: number;
  from: string;
  to: string;
  value: string;
  type: "transfer" | "contract_call" | "job_post" | "attestation" | "stake" | "governance";
  status: "confirmed" | "pending" | "failed";
  gasUsed: number;
  fee: string;
  timestamp: string;
  nonce: number;
}

export interface NetworkStats {
  tps: number;
  blockTime: number;
  totalBlocks: number;
  totalTxs: number;
  totalAddresses: number;
  totalStaked: string;
  nectaPrice: number;
  marketCap: string;
  gasPrice: string;
  activeMiners: number;
  activeDevices: number;
  activeJobs: number;
}

export interface Device {
  deviceId: string;
  fingerprint: string;
  owner: string;
  metadataURI: string;
  attestationCount: number;
  status: "active" | "inactive" | "slashed";
  stakedAmount: string;
  uptime: number;
}

export interface Operator {
  operatorId: string;
  address: string;
  stake: string;
  delegations: number;
  uptimePercent: number;
  jobsCompleted: number;
  slashes: number;
  reputation: number;
  status: "active" | "inactive" | "slashed";
}

export interface AIJob {
  jobId: string;
  poster: string;
  worker: string | null;
  status: "posted" | "bidding" | "assigned" | "proving" | "completed" | "disputed";
  proofType: "deterministic" | "enclave" | "zk";
  reward: string;
  createdAt: string;
  completedAt: string | null;
  description: string;
}

export interface Gateway {
  gatewayId: string;
  operatorId: string;
  operatorAddress: string;
  stake: string;
  uptime: number;
  batchCount: number;
  deviceCount: number;
  lastBatchTimestamp: string;
}

export interface Proposal {
  proposalId: string;
  title: string;
  proposer: string;
  votesFor: number;
  votesAgainst: number;
  status: "active" | "passed" | "rejected" | "executed";
  createdAt: string;
  executionState: string;
  description: string;
}

export interface TreasuryData {
  balance: string;
  inflows: string;
  outflows: string;
  recentTransactions: {
    type: string;
    amount: string;
    recipient: string;
    timestamp: string;
  }[];
}

export interface ChartPoint {
  timestamp: string;
  value: number;
}

// ─── Deterministic seed helper ──────────────────────────────────────────────
// Replaces Math.random() to avoid SSR hydration mismatches

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);

// Fixed anchor timestamp to avoid Date.now() hydration mismatches
const ANCHOR = new Date("2026-04-05T10:00:00.000Z").getTime();
const hour = 3600_000;
const day = 86400_000;
const ts = (offset: number) => new Date(ANCHOR - offset).toISOString();

// ─── Network Stats ───────────────────────────────────────────────────────────

export const networkStats: NetworkStats = {
  tps: 847,
  blockTime: 2,
  totalBlocks: 2_400_312,
  totalTxs: 24_871_455,
  totalAddresses: 1_287_432,
  totalStaked: "45,200,000",
  nectaPrice: 0.47,
  marketCap: "47,000,000",
  gasPrice: "0.001 gwei",
  activeMiners: 12_847,
  activeDevices: 34_521,
  activeJobs: 1_284,
};

// ─── Blocks ──────────────────────────────────────────────────────────────────

export const blocks: Block[] = Array.from({ length: 15 }, (_, i) => ({
  height: 2_400_312 - i,
  hash: `0x${(0xa3f7e2 + i * 0x1111).toString(16).padStart(8, "0")}b8c1d4e5f6a7b8c1d4e5f6a7b8c1d4e5f6a7b8c1d4e5f6a7b8c1d4e5`,
  parentHash: `0x${(0xa3f7e1 + i * 0x1111).toString(16).padStart(8, "0")}c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9`,
  timestamp: ts(i * 2000),
  proposer: `0x${(0x7a1b + i * 0x33).toString(16).padStart(4, "0")}C3d4E5f6A7b8C9d0E1f2A3b4C5d6E7f8`,
  txCount: Math.floor(rand() * 180) + 20,
  gasUsed: Math.floor(rand() * 12_000_000) + 3_000_000,
  gasLimit: 30_000_000,
  zkProofAnchor: `0xzk${(0xf1e2d3 + i * 0x222).toString(16).padStart(8, "0")}a1b2c3d4e5f6`,
}));

// ─── Transactions ────────────────────────────────────────────────────────────

const txTypes: Transaction["type"][] = [
  "transfer", "contract_call", "job_post", "attestation", "stake", "governance",
  "transfer", "transfer", "contract_call", "transfer", "job_post", "attestation",
  "transfer", "stake", "contract_call",
];

export const transactions: Transaction[] = Array.from({ length: 15 }, (_, i) => ({
  hash: `0x${(0x8a3f + i * 0x4444).toString(16).padStart(8, "0")}e2b1c3d4a5f6e7b8c9d0a1f2e3b4c5d6a7f8e9b0c1d2a3f4e5b6c7d8`,
  blockNumber: 2_400_312 - Math.floor(i / 3),
  from: `0x${(0x1a2b + i * 0x11).toString(16).padStart(4, "0")}D4e5F6a7B8c9D0e1F2a3B4c5D6e7F8a9`,
  to: `0x${(0x9f8e + i * 0x22).toString(16).padStart(4, "0")}A1b2C3d4E5f6A7b8C9d0E1f2A3b4C5d6`,
  value: (rand() * 5000 + 1).toFixed(2),
  type: txTypes[i],
  status: i === 4 ? "pending" : i === 12 ? "failed" : "confirmed",
  gasUsed: Math.floor(rand() * 200_000) + 21_000,
  fee: (rand() * 0.005 + 0.0001).toFixed(6),
  timestamp: ts(i * 3500 + rand() * 1000),
  nonce: Math.floor(rand() * 500),
}));

// ─── DePIN Devices ───────────────────────────────────────────────────────────

export const devices: Device[] = Array.from({ length: 12 }, (_, i) => ({
  deviceId: `DEV-${(1000 + i).toString()}`,
  fingerprint: `0x${(0xd1e2f3 + i * 0x555).toString(16).padStart(8, "0")}a4b5c6d7e8f9a0b1c2d3`,
  owner: `0x${(0x3c4d + i * 0x15).toString(16).padStart(4, "0")}E5f6A7b8C9d0E1f2A3b4C5d6E7f8A9b0`,
  metadataURI: `ipfs://Qm${(0xaabb + i).toString(16)}...`,
  attestationCount: Math.floor(rand() * 200) + 5,
  status: i === 3 ? "inactive" : i === 9 ? "slashed" : "active",
  stakedAmount: (rand() * 10000 + 500).toFixed(0),
  uptime: i === 9 ? 12.4 : rand() * 15 + 85,
}));

// ─── Operators ───────────────────────────────────────────────────────────────

export const operators: Operator[] = Array.from({ length: 12 }, (_, i) => ({
  operatorId: `OP-${(100 + i).toString()}`,
  address: `0x${(0x5e6f + i * 0x19).toString(16).padStart(4, "0")}B8c9D0e1F2a3B4c5D6e7F8a9B0c1D2e3`,
  stake: (rand() * 500_000 + 10_000).toFixed(0),
  delegations: Math.floor(rand() * 50) + 1,
  uptimePercent: i === 10 ? 67.2 : rand() * 10 + 90,
  jobsCompleted: Math.floor(rand() * 5000) + 100,
  slashes: i === 10 ? 3 : i === 7 ? 1 : 0,
  reputation: i === 10 ? 42 : Math.floor(rand() * 20) + 80,
  status: i === 10 ? "slashed" : i === 8 ? "inactive" : "active",
}));

// ─── AI Jobs ─────────────────────────────────────────────────────────────────

const jobStatuses: AIJob["status"][] = [
  "completed", "completed", "proving", "assigned", "bidding", "posted",
  "completed", "disputed", "completed", "proving", "completed", "assigned",
];
const proofTypes: AIJob["proofType"][] = [
  "zk", "deterministic", "enclave", "zk", "deterministic", "zk",
  "enclave", "zk", "deterministic", "enclave", "zk", "deterministic",
];
const jobDescs = [
  "GPT-4 Fine-tune on Medical Data", "Image Classification Pipeline", "LLM Inference Benchmark",
  "Sentiment Analysis Batch", "Stable Diffusion Training", "NLP Token Embedding Generation",
  "Speech-to-Text Transcription", "Fraud Detection Model", "Recommendation Engine Training",
  "Video Object Detection", "RAG Pipeline Indexing", "Time Series Forecasting",
];

export const aiJobs: AIJob[] = Array.from({ length: 12 }, (_, i) => ({
  jobId: `JOB-${(5000 + i).toString()}`,
  poster: `0x${(0x2a3b + i * 0x12).toString(16).padStart(4, "0")}F6a7B8c9D0e1F2a3B4c5D6e7F8a9B0c1`,
  worker: jobStatuses[i] === "posted" || jobStatuses[i] === "bidding"
    ? null
    : `0x${(0xc1d2 + i * 0x31).toString(16).padStart(4, "0")}A3b4C5d6E7f8A9b0C1d2E3f4A5b6C7d8`,
  status: jobStatuses[i],
  proofType: proofTypes[i],
  reward: (rand() * 2000 + 50).toFixed(0),
  createdAt: ts(i * day * 0.4 + rand() * hour * 6),
  completedAt: jobStatuses[i] === "completed" ? ts(i * day * 0.3) : null,
  description: jobDescs[i],
}));

// ─── IoT Gateways ────────────────────────────────────────────────────────────

export const gateways: Gateway[] = Array.from({ length: 10 }, (_, i) => ({
  gatewayId: `GW-${(200 + i).toString()}`,
  operatorId: `OP-${(100 + i).toString()}`,
  operatorAddress: `0x${(0x5e6f + i * 0x19).toString(16).padStart(4, "0")}B8c9D0e1F2a3B4c5D6e7F8a9B0c1D2e3`,
  stake: (rand() * 100_000 + 5_000).toFixed(0),
  uptime: rand() * 8 + 92,
  batchCount: Math.floor(rand() * 10000) + 200,
  deviceCount: Math.floor(rand() * 500) + 10,
  lastBatchTimestamp: ts(Math.floor(rand() * hour * 2)),
}));

// ─── Governance Proposals ────────────────────────────────────────────────────

export const proposals: Proposal[] = [
  {
    proposalId: "NCP-42",
    title: "Increase Miner Base Reward by 15%",
    proposer: "0x7a1bC3d4E5f6A7b8C9d0E1f2A3b4C5d6E7f8A9b0",
    votesFor: 2_847_000,
    votesAgainst: 412_000,
    status: "active",
    createdAt: ts(day * 2),
    executionState: "pending",
    description: "Proposal to increase base mining rewards across all task categories by 15% to incentivize network growth.",
  },
  {
    proposalId: "NCP-41",
    title: "Add Celestia as Secondary DA Layer",
    proposer: "0x5e6fB8c9D0e1F2a3B4c5D6e7F8a9B0c1D2e3F4a5",
    votesFor: 3_214_000,
    votesAgainst: 891_000,
    status: "passed",
    createdAt: ts(day * 5),
    executionState: "queued",
    description: "Integrate Celestia as a fallback DA provider to reduce costs during high throughput periods.",
  },
  {
    proposalId: "NCP-40",
    title: "Launch AI Compute Marketplace v2",
    proposer: "0x2a3bF6a7B8c9D0e1F2a3B4c5D6e7F8a9B0c1D2e3",
    votesFor: 4_102_000,
    votesAgainst: 203_000,
    status: "executed",
    createdAt: ts(day * 12),
    executionState: "executed",
    description: "Upgrade the AI compute marketplace with support for multi-GPU jobs and improved proof verification.",
  },
  {
    proposalId: "NCP-39",
    title: "Reduce Slashing Penalty for First Offense",
    proposer: "0x9f8eA1b2C3d4E5f6A7b8C9d0E1f2A3b4C5d6E7f8",
    votesFor: 1_450_000,
    votesAgainst: 2_100_000,
    status: "rejected",
    createdAt: ts(day * 15),
    executionState: "none",
    description: "Reduce the slashing penalty from 10% to 5% for operators who receive their first offense.",
  },
  {
    proposalId: "NCP-38",
    title: "Fund IoT Gateway Expansion Grant",
    proposer: "0x3c4dE5f6A7b8C9d0E1f2A3b4C5d6E7f8A9b0C1d2",
    votesFor: 3_800_000,
    votesAgainst: 340_000,
    status: "executed",
    createdAt: ts(day * 20),
    executionState: "executed",
    description: "Allocate 500,000 NECTA from treasury for IoT gateway hardware subsidies in emerging markets.",
  },
];

// ─── Treasury ────────────────────────────────────────────────────────────────

export const treasury: TreasuryData = {
  balance: "12,450,000",
  inflows: "847,000",
  outflows: "312,000",
  recentTransactions: [
    { type: "Grant", amount: "150,000", recipient: "0x3c4dE5f6...C1d2", timestamp: ts(day) },
    { type: "Reward Distribution", amount: "87,500", recipient: "StakeManager", timestamp: ts(day * 1.5) },
    { type: "Fee Revenue", amount: "23,400", recipient: "Treasury", timestamp: ts(day * 2) },
    { type: "Grant", amount: "75,000", recipient: "0x2a3bF6a7...D2e3", timestamp: ts(day * 3) },
    { type: "Protocol Fee", amount: "45,200", recipient: "Treasury", timestamp: ts(day * 3.5) },
  ],
};

// ─── Chart Data ──────────────────────────────────────────────────────────────

export const tpsHistory: ChartPoint[] = Array.from({ length: 24 }, (_, i) => ({
  timestamp: `${String((i + 1) % 24).padStart(2, "0")}:00`,
  value: Math.floor(rand() * 400) + 600,
}));

export const stakingHistory: ChartPoint[] = Array.from({ length: 24 }, (_, i) => ({
  timestamp: `${String((i + 1) % 24).padStart(2, "0")}:00`,
  value: Math.floor(40_000_000 + i * 200_000 + rand() * 500_000),
}));

// ─── Token Holders (for tokens page) ────────────────────────────────────────

export const tokenHolders = Array.from({ length: 10 }, (_, i) => ({
  address: `0x${(0xaa11 + i * 0x33).toString(16).padStart(4, "0")}B2c3D4e5F6a7B8c9D0e1F2a3B4c5D6e7`,
  balance: (10_000_000 - i * 850_000 + rand() * 100_000).toFixed(0),
  percentage: (12.5 - i * 1.1).toFixed(1),
}));

// ─── New Types ──────────────────────────────────────────────────────────────

export interface EventLog {
  logIndex: number;
  address: string;
  eventName: string;
  topics: string[];
  data: string;
  blockNumber: number;
  txHash: string;
  timestamp: string;
}

export interface InternalTx {
  txHash: string;
  from: string;
  to: string;
  value: string;
  type: "call" | "create" | "delegatecall";
  depth: number;
}

export interface TokenHolding {
  tokenName: string;
  tokenSymbol: string;
  tokenAddress: string;
  balance: string;
  value: string;
  decimals: number;
  price: string;
  change24h: string;
}

export interface ERC20Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  holders: number;
  price: string;
  change24h: string;
  volume24h: string;
}

export interface ProposalVote {
  voter: string;
  support: "for" | "against";
  weight: number;
  timestamp: string;
}

export interface UnstakeEntry {
  address: string;
  amount: string;
  unlockTime: string;
  status: "pending" | "ready" | "claimed";
}

export interface ContractEvent {
  address: string;
  contractName: string;
  eventName: string;
  args: string;
  blockNumber: number;
  timestamp: string;
}

export interface DeviceLocation {
  deviceId: string;
  lat: number;
  lng: number;
  region: string;
  status: "active" | "inactive";
}

// ─── Extended Blocks (100 items) ────────────────────────────────────────────

export const blocksExtended: (Block & { reward: string })[] = Array.from(
  { length: 100 },
  (_, i) => ({
    height: 2_400_312 - i,
    hash: `0x${(0xa3f7e2 + i * 0x1111).toString(16).padStart(8, "0")}b8c1d4e5f6a7b8c1d4e5f6a7b8c1d4e5f6a7b8c1d4e5f6a7b8c1d4e5`,
    parentHash: `0x${(0xa3f7e1 + i * 0x1111).toString(16).padStart(8, "0")}c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9`,
    timestamp: ts(i * 2000),
    proposer: `0x${(0x7a1b + i * 0x33).toString(16).padStart(4, "0")}C3d4E5f6A7b8C9d0E1f2A3b4C5d6E7f8`,
    txCount: Math.floor(rand() * 180) + 20,
    gasUsed: Math.floor(rand() * 12_000_000) + 3_000_000,
    gasLimit: 30_000_000,
    zkProofAnchor: `0xzk${(0xf1e2d3 + i * 0x222).toString(16).padStart(8, "0")}a1b2c3d4e5f6`,
    reward: (rand() * 15 + 5).toFixed(2),
  }),
);

// ─── Extended Transactions (100 items) ──────────────────────────────────────

const methodNames = [
  "transfer", "registerDevice", "postJob", "stakeDeposit", "vote",
  "claimReward", "submitProof", "delegateStake", "createProposal", "approve",
  "withdrawStake", "updateMetadata", "cancelJob", "reportNode", "batchAttest",
];

const txTypesExtended: Transaction["type"][] = [
  "transfer", "contract_call", "job_post", "attestation", "stake", "governance",
];

export const transactionsExtended: (Transaction & {
  methodName: string;
  internalTxCount: number;
})[] = Array.from({ length: 100 }, (_, i) => ({
  hash: `0x${(0x8a3f + i * 0x2222).toString(16).padStart(8, "0")}e2b1c3d4a5f6e7b8c9d0a1f2e3b4c5d6a7f8e9b0c1d2a3f4e5b6c7d8`,
  blockNumber: 2_400_312 - Math.floor(i / 3),
  from: `0x${(0x1a2b + i * 0x11).toString(16).padStart(4, "0")}D4e5F6a7B8c9D0e1F2a3B4c5D6e7F8a9`,
  to: `0x${(0x9f8e + i * 0x22).toString(16).padStart(4, "0")}A1b2C3d4E5f6A7b8C9d0E1f2A3b4C5d6`,
  value: (rand() * 5000 + 1).toFixed(2),
  type: txTypesExtended[Math.floor(rand() * txTypesExtended.length)],
  status: rand() > 0.95 ? "failed" : rand() > 0.9 ? "pending" : "confirmed",
  gasUsed: Math.floor(rand() * 200_000) + 21_000,
  fee: (rand() * 0.005 + 0.0001).toFixed(6),
  timestamp: ts(i * 3500 + rand() * 1000),
  nonce: Math.floor(rand() * 500),
  methodName: methodNames[Math.floor(rand() * methodNames.length)],
  internalTxCount: Math.floor(rand() * 5),
}));

// ─── Event Logs (50 items) ──────────────────────────────────────────────────

const eventNames = [
  "Transfer", "Approval", "DeviceRegistered", "JobPosted",
  "StakeDeposited", "ProposalCreated",
];

export const eventLogs: EventLog[] = Array.from({ length: 50 }, (_, i) => ({
  logIndex: i,
  address: `0x${(0xc0de + i * 0x44).toString(16).padStart(8, "0")}A1b2C3d4E5f6A7b8C9d0E1f2`,
  eventName: eventNames[Math.floor(rand() * eventNames.length)],
  topics: [
    `0x${(0xdead0000 + i * 0x111).toString(16).padStart(64, "0")}`,
    `0x${(0xbeef0000 + i * 0x222).toString(16).padStart(64, "0")}`,
  ],
  data: `0x${(0xaabb0000 + i * 0x333).toString(16).padStart(64, "0")}`,
  blockNumber: 2_400_312 - Math.floor(rand() * 50),
  txHash: `0x${(0x5a6b + i * 0x3333).toString(16).padStart(8, "0")}d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1`,
  timestamp: ts(i * hour * 0.5 + rand() * hour),
}));

// ─── Internal Transactions (30 items) ───────────────────────────────────────

const internalTypes: InternalTx["type"][] = ["call", "create", "delegatecall"];

export const internalTransactions: InternalTx[] = Array.from(
  { length: 30 },
  (_, i) => ({
    txHash: `0x${(0x7c8d + i * 0x4444).toString(16).padStart(8, "0")}a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8`,
    from: `0x${(0x1111 + i * 0x22).toString(16).padStart(4, "0")}E5f6A7b8C9d0E1f2A3b4C5d6E7f8A9b0`,
    to: `0x${(0x2222 + i * 0x33).toString(16).padStart(4, "0")}F6a7B8c9D0e1F2a3B4c5D6e7F8a9B0c1`,
    value: (rand() * 1000).toFixed(4),
    type: internalTypes[Math.floor(rand() * internalTypes.length)],
    depth: Math.floor(rand() * 4) + 1,
  }),
);

// ─── ERC-20 Tokens (8 tokens) ──────────────────────────────────────────────

export const erc20Tokens: ERC20Token[] = [
  {
    address: "0xNECTA000000000000000000000000000000000001",
    name: "Necter",
    symbol: "NECTA",
    decimals: 18,
    totalSupply: "100,000,000",
    holders: 48_721,
    price: "0.47",
    change24h: "+3.2",
    volume24h: "2,450,000",
  },
  {
    address: "0xwETH0000000000000000000000000000000000002",
    name: "Wrapped Ether",
    symbol: "wETH",
    decimals: 18,
    totalSupply: "12,400",
    holders: 31_204,
    price: "3,245.80",
    change24h: "-1.1",
    volume24h: "18,700,000",
  },
  {
    address: "0xUSDC0000000000000000000000000000000000003",
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    totalSupply: "8,500,000",
    holders: 22_140,
    price: "1.00",
    change24h: "+0.01",
    volume24h: "5,100,000",
  },
  {
    address: "0xDAI00000000000000000000000000000000000004",
    name: "Dai Stablecoin",
    symbol: "DAI",
    decimals: 18,
    totalSupply: "3,200,000",
    holders: 9_871,
    price: "1.00",
    change24h: "-0.02",
    volume24h: "1,200,000",
  },
  {
    address: "0xstNECTA00000000000000000000000000000000005",
    name: "Staked Necter",
    symbol: "stNECTA",
    decimals: 18,
    totalSupply: "45,200,000",
    holders: 14_382,
    price: "0.49",
    change24h: "+3.5",
    volume24h: "890,000",
  },
  {
    address: "0xvNECTA000000000000000000000000000000000006",
    name: "Vote-escrowed Necter",
    symbol: "vNECTA",
    decimals: 18,
    totalSupply: "12,800,000",
    holders: 5_214,
    price: "0.52",
    change24h: "+4.1",
    volume24h: "320,000",
  },
  {
    address: "0xlpNECTA0000000000000000000000000000000007",
    name: "NECTA-ETH LP Token",
    symbol: "lpNECTA-ETH",
    decimals: 18,
    totalSupply: "2,100,000",
    holders: 3_891,
    price: "1.24",
    change24h: "+1.8",
    volume24h: "640,000",
  },
  {
    address: "0xHIVE0000000000000000000000000000000000008",
    name: "Hive Token",
    symbol: "HIVE",
    decimals: 18,
    totalSupply: "50,000,000",
    holders: 7_402,
    price: "0.08",
    change24h: "-2.4",
    volume24h: "410,000",
  },
];

// ─── NECTA Price History (30 days) ──────────────────────────────────────────

export const priceHistory: ChartPoint[] = Array.from({ length: 30 }, (_, i) => {
  const base = 0.35 + (i / 29) * 0.12; // trend from ~0.35 to ~0.47
  const noise = (rand() - 0.5) * 0.04;
  return {
    timestamp: ts((29 - i) * day),
    value: parseFloat((base + noise).toFixed(4)),
  };
});

// ─── Network Heatmap (7 days x 24 hours) ────────────────────────────────────

export const networkHeatmap: number[][] = Array.from({ length: 7 }, () =>
  Array.from({ length: 24 }, () => Math.floor(rand() * 100)),
);

// ─── Treasury Flow History (30 days) ────────────────────────────────────────

export const treasuryFlowHistory: {
  timestamp: string;
  inflow: number;
  outflow: number;
}[] = Array.from({ length: 30 }, (_, i) => ({
  timestamp: ts((29 - i) * day),
  inflow: Math.floor(rand() * 80_000) + 20_000,
  outflow: Math.floor(rand() * 50_000) + 10_000,
}));

// ─── Proposal Votes (20 for NCP-42) ────────────────────────────────────────

export const proposalVotes: ProposalVote[] = Array.from(
  { length: 20 },
  (_, i) => ({
    voter: `0x${(0x4a5b + i * 0x55).toString(16).padStart(4, "0")}C3d4E5f6A7b8C9d0E1f2A3b4C5d6E7f8`,
    support: rand() > 0.3 ? ("for" as const) : ("against" as const),
    weight: Math.floor(rand() * 200_000) + 10_000,
    timestamp: ts(i * hour * 3 + rand() * hour * 2),
  }),
);

// ─── Unstaking Queue (8 items) ──────────────────────────────────────────────

const unstakeStatuses: UnstakeEntry["status"][] = ["pending", "ready", "claimed"];

export const unstakingQueue: UnstakeEntry[] = Array.from(
  { length: 8 },
  (_, i) => ({
    address: `0x${(0x6c7d + i * 0x44).toString(16).padStart(4, "0")}A1b2C3d4E5f6A7b8C9d0E1f2A3b4C5d6`,
    amount: (rand() * 50_000 + 1_000).toFixed(0),
    unlockTime: ts(-day * (i + 1) * (rand() > 0.5 ? 1 : -1)),
    status: unstakeStatuses[Math.floor(rand() * unstakeStatuses.length)],
  }),
);

// ─── Contract Events (20 items) ─────────────────────────────────────────────

const contractNames = ["DeviceRegistry", "JobManager", "StakeManager"];
const contractEventNames: Record<string, string[]> = {
  DeviceRegistry: ["DeviceRegistered", "DeviceDeactivated", "AttestationSubmitted"],
  JobManager: ["JobPosted", "JobAssigned", "JobCompleted", "JobDisputed"],
  StakeManager: ["StakeDeposited", "StakeWithdrawn", "SlashApplied", "RewardClaimed"],
};

export const contractEvents: ContractEvent[] = Array.from(
  { length: 20 },
  (_, i) => {
    const contractName =
      contractNames[Math.floor(rand() * contractNames.length)];
    const possibleEvents = contractEventNames[contractName];
    const eventName =
      possibleEvents[Math.floor(rand() * possibleEvents.length)];
    return {
      address: `0x${(0xe1f2 + i * 0x33).toString(16).padStart(4, "0")}B8c9D0e1F2a3B4c5D6e7F8a9B0c1D2e3`,
      contractName,
      eventName,
      args: `{"id":"${Math.floor(rand() * 9999)}","value":"${(rand() * 10000).toFixed(2)}"}`,
      blockNumber: 2_400_312 - Math.floor(rand() * 100),
      timestamp: ts(i * hour * 1.2 + rand() * hour),
    };
  },
);

// ─── APY History (30 days) ──────────────────────────────────────────────────

export const apyHistory: ChartPoint[] = Array.from({ length: 30 }, (_, i) => ({
  timestamp: ts((29 - i) * day),
  value: parseFloat((rand() * 4 + 8).toFixed(2)), // 8-12%
}));

// ─── Compute Utilization (24 hours) ─────────────────────────────────────────

export const computeUtilization: ChartPoint[] = Array.from(
  { length: 24 },
  (_, i) => ({
    timestamp: `${String(i).padStart(2, "0")}:00`,
    value: parseFloat((rand() * 100).toFixed(1)),
  }),
);

// ─── Batch Throughput (24 hours) ────────────────────────────────────────────

export const batchThroughput: ChartPoint[] = Array.from(
  { length: 24 },
  (_, i) => ({
    timestamp: `${String(i).padStart(2, "0")}:00`,
    value: Math.floor(rand() * 60) + 10, // batches per hour
  }),
);

// ─── Device Locations (12 items) ────────────────────────────────────────────

export const deviceLocations: DeviceLocation[] = [
  { deviceId: "DEV-1000", lat: 37.7749, lng: -122.4194, region: "US West", status: "active" },
  { deviceId: "DEV-1001", lat: 40.7128, lng: -74.006, region: "US East", status: "active" },
  { deviceId: "DEV-1002", lat: 51.5074, lng: -0.1278, region: "Europe", status: "active" },
  { deviceId: "DEV-1003", lat: 48.8566, lng: 2.3522, region: "Europe", status: "inactive" },
  { deviceId: "DEV-1004", lat: 35.6762, lng: 139.6503, region: "Asia", status: "active" },
  { deviceId: "DEV-1005", lat: 1.3521, lng: 103.8198, region: "Asia", status: "active" },
  { deviceId: "DEV-1006", lat: 34.0522, lng: -118.2437, region: "US West", status: "active" },
  { deviceId: "DEV-1007", lat: 52.52, lng: 13.405, region: "Europe", status: "active" },
  { deviceId: "DEV-1008", lat: 22.3193, lng: 114.1694, region: "Asia", status: "inactive" },
  { deviceId: "DEV-1009", lat: 41.8781, lng: -87.6298, region: "US Central", status: "active" },
  { deviceId: "DEV-1010", lat: -33.8688, lng: 151.2093, region: "Oceania", status: "active" },
  { deviceId: "DEV-1011", lat: 25.2048, lng: 55.2708, region: "Middle East", status: "active" },
];

// ─── Stake Distribution (6 items) ───────────────────────────────────────────

export const stakeDistribution: {
  label: string;
  value: number;
  color: string;
}[] = [
  { label: "OP-100 (NectarStake)", value: 8_400_000, color: "#7c3aed" },
  { label: "OP-101 (HivePool)", value: 6_200_000, color: "#6366f1" },
  { label: "OP-102 (ZenithNode)", value: 5_100_000, color: "#818cf8" },
  { label: "OP-103 (QuantumRelay)", value: 4_300_000, color: "#a78bfa" },
  { label: "OP-104 (EdgeCore)", value: 3_700_000, color: "#c4b5fd" },
  { label: "Other", value: 17_500_000, color: "#475569" },
];

// ─── Address Details Helper ─────────────────────────────────────────────────

function generateTokenHoldings(r: () => number): TokenHolding[] {
  const count = Math.floor(r() * 4) + 3; // 3-6 holdings
  return Array.from({ length: count }, (_, i) => {
    const token = erc20Tokens[Math.floor(r() * erc20Tokens.length)];
    const balance = (r() * 100_000 + 100).toFixed(2);
    const price = parseFloat(token.price.replace(/,/g, ""));
    const value = (parseFloat(balance) * price).toFixed(2);
    return {
      tokenName: token.name,
      tokenSymbol: token.symbol,
      tokenAddress: token.address,
      balance,
      value,
      decimals: token.decimals,
      price: token.price,
      change24h: ((r() - 0.5) * 10).toFixed(2),
    };
  });
}

export function getAddressDetails(hash: string) {
  const seed = hash.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const r = mulberry32(seed);
  return {
    balance: (r() * 50_000 + 100).toFixed(2),
    usdValue: (r() * 25_000 + 50).toFixed(2),
    txCount: Math.floor(r() * 500) + 10,
    isContract: r() > 0.7,
    isStaker: r() > 0.5,
    isOperator: r() > 0.8,
    tokenHoldings: generateTokenHoldings(r),
  };
}
