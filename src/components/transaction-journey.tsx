"use client";

import { CheckCircle, Loader2, Route } from "lucide-react";
import { HashLink } from "@/components/hash-link";
import { TimeAgo } from "@/components/time-ago";

interface JourneyStep {
  title: string;
  module: string;
  color: string;
  txHash: string;
  timestamp: string;
  status: "complete" | "pending";
}

const ANCHOR = new Date("2026-04-05T10:00:00.000Z").getTime();
const hour = 3_600_000;

function hashToSeed(hash: string): number {
  let h = 0;
  for (let i = 0; i < hash.length; i++) {
    h = ((h << 5) - h + hash.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function generateSteps(txHash: string): JourneyStep[] {
  const seed = hashToSeed(txHash);
  const journeyType = seed % 3; // 0=A, 1=B, 2=C

  const makeHash = (i: number) => {
    const s = hashToSeed(txHash + String(i));
    return "0x" + s.toString(16).padStart(64, "a").slice(0, 64);
  };

  const ts = (offsetHours: number) =>
    new Date(ANCHOR - offsetHours * hour).toISOString();

  // Decide if last step is pending based on seed
  const lastPending = seed % 5 === 0;

  if (journeyType === 0) {
    // Type A: Device -> Job -> Proof -> Payout
    const steps: JourneyStep[] = [
      {
        title: "Device Registration",
        module: "DePIN",
        color: "#6E9FFF",
        txHash: makeHash(0),
        timestamp: ts(48),
        status: "complete",
      },
      {
        title: "AI Job Posted",
        module: "AI Compute",
        color: "#9985FF",
        txHash: makeHash(1),
        timestamp: ts(24),
        status: "complete",
      },
      {
        title: "Proof Submitted",
        module: "Verification",
        color: "#22C55E",
        txHash: makeHash(2),
        timestamp: ts(6),
        status: "complete",
      },
      {
        title: "Payout Sent",
        module: "Treasury",
        color: "#FFC933",
        txHash: makeHash(3),
        timestamp: ts(1),
        status: lastPending ? "pending" : "complete",
      },
    ];
    return steps;
  }

  if (journeyType === 1) {
    // Type B: Stake -> Delegation -> Reward
    return [
      {
        title: "Stake Deposited",
        module: "DePIN",
        color: "#6E9FFF",
        txHash: makeHash(0),
        timestamp: ts(72),
        status: "complete",
      },
      {
        title: "Delegation Set",
        module: "DePIN",
        color: "#6E9FFF",
        txHash: makeHash(1),
        timestamp: ts(48),
        status: "complete",
      },
      {
        title: "Epoch Finalized",
        module: "Verification",
        color: "#22C55E",
        txHash: makeHash(2),
        timestamp: ts(12),
        status: "complete",
      },
      {
        title: "Reward Claimed",
        module: "Treasury",
        color: "#FFC933",
        txHash: makeHash(3),
        timestamp: ts(2),
        status: lastPending ? "pending" : "complete",
      },
    ];
  }

  // Type C: Proposal -> Vote -> Execution
  return [
    {
      title: "Proposal Created",
      module: "Governance",
      color: "#9985FF",
      txHash: makeHash(0),
      timestamp: ts(168),
      status: "complete",
    },
    {
      title: "Voting Period",
      module: "Governance",
      color: "#9985FF",
      txHash: makeHash(1),
      timestamp: ts(96),
      status: "complete",
    },
    {
      title: "Quorum Reached",
      module: "Governance",
      color: "#9985FF",
      txHash: makeHash(2),
      timestamp: ts(48),
      status: "complete",
    },
    {
      title: "Proposal Executed",
      module: "Treasury",
      color: "#FFC933",
      txHash: makeHash(3),
      timestamp: ts(6),
      status: lastPending ? "pending" : "complete",
    },
    {
      title: "Funds Disbursed",
      module: "Treasury",
      color: "#FFC933",
      txHash: makeHash(4),
      timestamp: ts(1),
      status: lastPending ? "pending" : "complete",
    },
  ];
}

export function TransactionJourney({ txHash }: { txHash: string }) {
  const steps = generateSteps(txHash);

  return (
    <div className="rounded-lg bg-card border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <Route className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-medium">Transaction Journey</h2>
      </div>

      <div className="flex items-start gap-0 overflow-x-auto pb-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start">
            {/* Step card */}
            <div className="bg-secondary rounded-md p-3 w-[140px] shrink-0">
              {/* Icon + module */}
              <div className="flex items-center gap-1.5 mb-2">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: step.color }}
                />
                <span
                  className="text-[10px] font-medium uppercase tracking-wider"
                  style={{ color: step.color }}
                >
                  {step.module}
                </span>
              </div>

              {/* Title */}
              <p className="text-xs font-medium mb-1.5 leading-tight">
                {step.title}
              </p>

              {/* Timestamp */}
              <div className="mb-1.5">
                <TimeAgo timestamp={step.timestamp} />
              </div>

              {/* Tx hash */}
              <div className="mb-1.5">
                <HashLink hash={step.txHash} type="tx" />
              </div>

              {/* Status */}
              <div className="flex items-center gap-1">
                {step.status === "complete" ? (
                  <>
                    <CheckCircle className="h-3 w-3 text-[#22C55E]" />
                    <span className="text-[10px] text-[#22C55E]">Complete</span>
                  </>
                ) : (
                  <>
                    <Loader2 className="h-3 w-3 text-[#F2994A] animate-spin" />
                    <span className="text-[10px] text-[#F2994A]">Pending</span>
                  </>
                )}
              </div>
            </div>

            {/* Connecting line + arrow */}
            {i < steps.length - 1 && (
              <div className="flex items-center relative top-6 shrink-0">
                <div className="w-6 h-px border-t border-dashed border-border" />
                <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[5px] border-l-border" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
