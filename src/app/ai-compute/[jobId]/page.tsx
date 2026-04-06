"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Circle } from "lucide-react";
import { HashLink } from "@/components/hash-link";
import { TimeAgo } from "@/components/time-ago";
import { StatusBadge } from "@/components/status-badge";
import { aiJobs } from "@/lib/mock-data";
import { MobileCard } from "@/components/mobile-card";

const lifecycleSteps = ["posted", "bidding", "assigned", "proving", "completed"];
const stepIndex: Record<string, number> = { posted: 0, bidding: 1, assigned: 2, proving: 3, completed: 4, disputed: 3 };

const ANCHOR = new Date("2026-04-05T10:00:00.000Z").getTime();
const hour = 3600_000;

const biddingHistory = [
  {
    bidder: "0x7a3b9c1d2e4f5678901234abcdef5678abcd1234",
    amount: 2800,
    timestamp: new Date(ANCHOR - 12 * hour).toISOString(),
    status: "accepted",
  },
  {
    bidder: "0x1f2e3d4c5b6a7890abcdef1234567890abcd5678",
    amount: 3200,
    timestamp: new Date(ANCHOR - 14 * hour).toISOString(),
    status: "rejected",
  },
  {
    bidder: "0x9e8d7c6b5a4f3210fedcba9876543210fedc9876",
    amount: 3500,
    timestamp: new Date(ANCHOR - 15 * hour).toISOString(),
    status: "rejected",
  },
  {
    bidder: "0x4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c",
    amount: 2950,
    timestamp: new Date(ANCHOR - 16 * hour).toISOString(),
    status: "pending",
  },
];

const computeRequirements = [
  { label: "GPU", value: "NVIDIA A100 80GB" },
  { label: "CPU", value: "8 vCPUs minimum" },
  { label: "Memory", value: "64 GB RAM" },
  { label: "Storage", value: "200 GB SSD" },
  { label: "Estimated Runtime", value: "4.2 hours" },
];

const bidStatusColor: Record<string, string> = {
  accepted: "bg-[#22C55E]/10 text-[#22C55E]",
  rejected: "bg-[#EB5757]/10 text-[#EB5757]",
  pending: "bg-[#F2994A]/10 text-[#F2994A]",
};

export default function JobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const job = aiJobs.find((j) => j.jobId === jobId);
  if (!job) {
    return (
      <div className="px-2.5 py-4">
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <img src="/brand/3d/bee-dark.png" alt="" className="h-20 w-auto opacity-50 mb-4" />
          <h1 className="text-lg font-semibold mb-1">Job Not Found</h1>
          <p className="text-sm text-muted-foreground mb-4">Job {jobId} does not exist.</p>
          <Link href="/ai-compute" className="text-sm text-primary hover:underline">View all jobs</Link>
        </div>
      </div>
    );
  }
  const currentStep = stepIndex[job.status] ?? 0;

  return (
    <div className="px-2.5 py-2 space-y-4">
      <Link href="/ai-compute" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> AI Compute
      </Link>

      <h1 className="text-xl font-semibold tracking-tight">{job.jobId}: {job.description}</h1>

      {/* Lifecycle */}
      <div className="rounded-lg bg-card border border-border p-5">
        <p className="text-xs text-muted-foreground mb-4">Job Lifecycle</p>
        <div className="flex items-center justify-between">
          {lifecycleSteps.map((step, i) => {
            const done = i < currentStep;
            const current = i === currentStep;
            return (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                    done ? "bg-[#22C55E] text-white" : current ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
                  }`}>
                    {done ? <CheckCircle className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                  </div>
                  <span className={`text-[11px] capitalize ${current ? "text-primary font-medium" : "text-muted-foreground"}`}>{step}</span>
                </div>
                {i < lifecycleSteps.length - 1 && (
                  <div className={`flex-1 h-px mx-2 ${i < currentStep ? "bg-[#22C55E]" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>
        {job.status === "disputed" && (
          <div className="mt-4 p-3 bg-[#EB5757]/10 border border-[#EB5757]/20 rounded-lg text-sm text-[#EB5757]">
            This job is under dispute resolution.
          </div>
        )}
      </div>

      {/* Details */}
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-medium">Details</h2>
        </div>
        {[
          { label: "Job ID", value: <span className="font-mono-data">{job.jobId}</span> },
          { label: "Description", value: job.description },
          { label: "Poster", value: <HashLink hash={job.poster} type="address" /> },
          { label: "Worker", value: job.worker ? <HashLink hash={job.worker} type="address" /> : <span className="text-muted-foreground">Unassigned</span> },
          { label: "Status", value: <StatusBadge status={job.status} /> },
          { label: "Proof Type", value: <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#9985FF]/10 text-[#9985FF] capitalize">{job.proofType}</span> },
          { label: "Reward", value: <span className="font-mono-data">{parseInt(job.reward).toLocaleString()} NECTA</span> },
          { label: "Created", value: <TimeAgo timestamp={job.createdAt} /> },
          { label: "Completed", value: job.completedAt ? <TimeAgo timestamp={job.completedAt} /> : <span className="text-muted-foreground">—</span> },
        ].map((row) => (
          <div key={row.label} className="flex items-center py-3 px-5 border-b border-border last:border-0">
            <span className="text-sm text-muted-foreground w-44 shrink-0">{row.label}</span>
            <span className="text-sm">{row.value}</span>
          </div>
        ))}
      </div>

      {/* Proof */}
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-medium">Proof Verification</h2>
        </div>
        <div>
          {job.proofType === "deterministic" && (
            <>
              <div className="flex items-center py-3 px-5 border-b border-border">
                <span className="text-sm text-muted-foreground w-44">Replay Log Hash</span>
                <span className="font-mono-data">0xreplay4a5b6c7d8e9f0a1b2c3d4e5f6</span>
              </div>
              <div className="flex items-center py-3 px-5">
                <span className="text-sm text-muted-foreground w-44">Verification</span>
                <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#22C55E]/10 text-[#22C55E]">Deterministic Match</span>
              </div>
            </>
          )}
          {job.proofType === "enclave" && (
            <>
              <div className="flex items-center py-3 px-5 border-b border-border">
                <span className="text-sm text-muted-foreground w-44">Enclave Attestation</span>
                <span className="font-mono-data">SGX-ATT-0x7e8f9a0b1c2d3e4f</span>
              </div>
              <div className="flex items-center py-3 px-5">
                <span className="text-sm text-muted-foreground w-44">TEE Type</span>
                <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#9985FF]/10 text-[#9985FF]">Intel SGX</span>
              </div>
            </>
          )}
          {job.proofType === "zk" && (
            <>
              <div className="flex items-center py-3 px-5 border-b border-border">
                <span className="text-sm text-muted-foreground w-44">ZK Proof Hash</span>
                <span className="font-mono-data text-[#9985FF]">0xzk00a1b2c3d4e5f6a7b8c9d0</span>
              </div>
              <div className="flex items-center py-3 px-5 border-b border-border">
                <span className="text-sm text-muted-foreground w-44">On-Chain Anchor</span>
                <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#22C55E]/10 text-[#22C55E]">Anchored</span>
              </div>
              <div className="flex items-center py-3 px-5">
                <span className="text-sm text-muted-foreground w-44">Proof System</span>
                <span className="text-sm">Kailua Hybrid-ZK</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bidding History */}
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-medium">Bidding History</h2>
        </div>
        {/* Mobile */}
        <div className="md:hidden space-y-3 p-4">
          {biddingHistory.map((bid, i) => (
            <MobileCard
              key={i}
              rows={[
                { label: "Bidder", value: <HashLink hash={bid.bidder} type="address" /> },
                { label: "Amount", value: <span className="font-mono-data">{bid.amount.toLocaleString()} NECTA</span> },
                { label: "Status", value: <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium capitalize ${bidStatusColor[bid.status]}`}>{bid.status}</span> },
              ]}
            />
          ))}
        </div>
        {/* Desktop */}
        <div className="hidden md:block">
          <div className="grid grid-cols-[1fr_100px_120px_90px] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
            <span>Bidder</span>
            <span className="text-right">Amount</span>
            <span>Time</span>
            <span>Status</span>
          </div>
          {biddingHistory.map((bid, i) => (
            <div
              key={i}
              className="row-hover grid grid-cols-[1fr_100px_120px_90px] gap-3 items-center px-5 py-2.5 border-b border-border last:border-0 text-sm"
            >
              <HashLink hash={bid.bidder} type="address" />
              <span className="text-right font-mono-data">{bid.amount.toLocaleString()} NECTA</span>
              <TimeAgo timestamp={bid.timestamp} />
              <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium capitalize ${bidStatusColor[bid.status]}`}>
                {bid.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Compute Requirements */}
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-medium">Compute Requirements</h2>
        </div>
        {computeRequirements.map((row) => (
          <div key={row.label} className="flex items-center py-3 px-5 border-b border-border last:border-0">
            <span className="text-sm text-muted-foreground w-44 shrink-0">{row.label}</span>
            <span className="text-sm font-mono-data">{row.value}</span>
          </div>
        ))}
      </div>

      {/* Worker Profile - only if job has a worker */}
      {job.worker && (
        <div className="rounded-lg bg-card border border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-medium">Worker Profile</h2>
          </div>
          {[
            { label: "Worker Address", value: <HashLink hash={job.worker} type="address" /> },
            {
              label: "Reputation Score",
              value: (
                <div className="flex items-center gap-3">
                  <span className="font-mono-data text-[#22C55E]">92/100</span>
                  <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-[#22C55E] rounded-full" style={{ width: "92%" }} />
                  </div>
                </div>
              ),
            },
            { label: "Jobs Completed", value: <span className="font-mono-data">1,247</span> },
            { label: "Success Rate", value: <span className="font-mono-data text-[#22C55E]">99.2%</span> },
            { label: "Avg Completion Time", value: <span className="font-mono-data">3.8 hours</span> },
          ].map((row) => (
            <div key={row.label} className="flex items-center py-3 px-5 border-b border-border last:border-0">
              <span className="text-sm text-muted-foreground w-44 shrink-0">{row.label}</span>
              <span className="text-sm">{row.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
