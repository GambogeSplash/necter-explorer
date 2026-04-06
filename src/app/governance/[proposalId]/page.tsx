"use client";

import { use } from "react";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, Circle } from "lucide-react";
import { HashLink } from "@/components/hash-link";
import { StatusBadge } from "@/components/status-badge";
import { TimeAgo } from "@/components/time-ago";
import { Pagination } from "@/components/pagination";
import { MobileCard } from "@/components/mobile-card";
import { proposals, proposalVotes } from "@/lib/mock-data";

// Mock execution details for executed proposals
function getExecutionDetails(proposalId: string) {
  const seed = proposalId.charCodeAt(proposalId.length - 1);
  return {
    txHash: `0x${(0xe1f2a3 + seed * 0x111).toString(16).padStart(8, "0")}b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0`,
    executedAt: new Date(new Date("2026-04-05T10:00:00.000Z").getTime() - 3 * 86400_000).toISOString(),
    changes: [
      { parameter: "BASE_REWARD_RATE", before: "100 NECTA", after: "115 NECTA" },
      { parameter: "REWARD_MULTIPLIER", before: "1.0x", after: "1.15x" },
      { parameter: "EPOCH_LENGTH", before: "7200 blocks", after: "7200 blocks" },
    ],
  };
}

const PAGE_SIZE = 10;

export default function ProposalDetailPage({
  params,
}: {
  params: Promise<{ proposalId: string }>;
}) {
  const { proposalId } = use(params);
  const [votePage, setVotePage] = useState(1);

  const proposal = proposals.find((p) => p.proposalId === proposalId);

  if (!proposal) {
    return (
      <div className="px-2.5 py-2 space-y-4">
        <Link
          href="/governance"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Governance
        </Link>
        <div className="rounded-lg bg-card border border-border p-8 text-center">
          <p className="text-muted-foreground">Proposal not found.</p>
        </div>
      </div>
    );
  }

  const total = proposal.votesFor + proposal.votesAgainst;
  const forPct = total > 0 ? (proposal.votesFor / total) * 100 : 0;
  const againstPct = total > 0 ? (proposal.votesAgainst / total) * 100 : 0;

  const isExecutedProposal = proposal.status === "executed";
  const execution = isExecutedProposal ? getExecutionDetails(proposalId) : null;

  // Timeline steps
  const isActive = proposal.status === "active";
  const isPassed = proposal.status === "passed";
  const isExecuted = proposal.status === "executed";
  const isRejected = proposal.status === "rejected";

  const timelineSteps = [
    {
      label: "Created",
      timestamp: new Date(proposal.createdAt).toLocaleDateString(),
      status: "done" as const,
    },
    {
      label: "Voting Started",
      timestamp: new Date(proposal.createdAt).toLocaleDateString(),
      status: "done" as const,
    },
    {
      label: "Voting Ended",
      timestamp:
        isActive
          ? "In progress"
          : new Date(
              new Date(proposal.createdAt).getTime() + 7 * 86400000,
            ).toLocaleDateString(),
      status: isActive ? ("current" as const) : ("done" as const),
    },
    {
      label: isRejected ? "Rejected" : "Execution",
      timestamp: isExecuted
        ? new Date(
            new Date(proposal.createdAt).getTime() + 10 * 86400000,
          ).toLocaleDateString()
        : isRejected
          ? "Proposal rejected"
          : "Pending",
      status: isExecuted || isRejected
        ? ("done" as const)
        : isPassed
          ? ("current" as const)
          : ("future" as const),
    },
  ];

  // Pagination for votes
  const voteTotalPages = Math.ceil(proposalVotes.length / PAGE_SIZE);
  const paginatedVotes = proposalVotes.slice(
    (votePage - 1) * PAGE_SIZE,
    votePage * PAGE_SIZE,
  );

  return (
    <div className="px-2.5 py-2 space-y-4">
      {/* Back link */}
      <Link
        href="/governance"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Governance
      </Link>

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono-data text-sm text-muted-foreground">
              {proposal.proposalId}
            </span>
            <StatusBadge status={proposal.status} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            {proposal.title}
          </h1>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-lg bg-card border border-border p-5">
        <h2 className="text-sm font-medium mb-3">Description</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {proposal.description}
        </p>
      </div>

      {/* Voting Results */}
      <div className="rounded-lg bg-card border border-border p-5">
        <h2 className="text-sm font-medium mb-4">Voting Results</h2>

        {/* Large progress bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-[#22C55E]" />
              <span className="text-sm font-medium text-[#22C55E]">For</span>
              <span className="text-sm font-mono-data text-muted-foreground">
                {(proposal.votesFor / 1_000_000).toFixed(2)}M votes (
                {forPct.toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono-data text-muted-foreground">
                {(proposal.votesAgainst / 1_000_000).toFixed(2)}M votes (
                {againstPct.toFixed(1)}%)
              </span>
              <span className="text-sm font-medium text-[#EB5757]">
                Against
              </span>
              <span className="inline-block w-3 h-3 rounded-full bg-[#EB5757]" />
            </div>
          </div>

          <div className="w-full h-4 bg-[#EB5757]/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#22C55E] rounded-full vote-fill"
              style={{ width: `${forPct}%` }}
            />
          </div>

          {/* Quorum indicator */}
          <div className="flex items-center gap-2 text-[11px]">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#22C55E]" />
            <span className="text-muted-foreground">
              Quorum reached: 65% participation
            </span>
          </div>
        </div>
      </div>

      {/* Voting Timeline */}
      <div className="rounded-lg bg-card border border-border p-5">
        <h2 className="text-sm font-medium mb-4">Voting Timeline</h2>
        <div className="space-y-0">
          {timelineSteps.map((step, i) => (
            <div key={i} className="flex gap-3">
              {/* Vertical line + icon */}
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-7 h-7 rounded-full border border-border bg-card">
                  {step.status === "done" ? (
                    <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
                  ) : step.status === "current" ? (
                    <Clock className="h-4 w-4 text-[#FFC933]" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                {i < timelineSteps.length - 1 && (
                  <div className="w-px h-8 bg-border" />
                )}
              </div>
              {/* Content */}
              <div className="pb-6">
                <p
                  className={`text-sm font-medium ${step.status === "future" ? "text-muted-foreground" : "text-foreground"}`}
                >
                  {step.label}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {step.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vote Breakdown Table */}
      <div className="space-y-4">
        <div className="rounded-lg bg-card border border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-medium">
              Vote Breakdown ({proposalVotes.length} votes)
            </h2>
          </div>
          {/* Mobile */}
          <div className="md:hidden space-y-3 p-4">
            {paginatedVotes.map((vote, i) => (
              <MobileCard
                key={i}
                rows={[
                  { label: "Voter", value: <HashLink hash={vote.voter} type="address" /> },
                  { label: "Vote", value: <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium capitalize ${vote.support === "for" ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-[#EB5757]/10 text-[#EB5757]"}`}>{vote.support}</span> },
                  { label: "Weight", value: <span className="font-mono-data">{vote.weight.toLocaleString()}</span> },
                ]}
              />
            ))}
          </div>
          {/* Desktop */}
          <div className="hidden md:block">
            <div className="grid grid-cols-[1fr_80px_100px_120px] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
              <span>Voter</span>
              <span>Vote</span>
              <span className="text-right">Weight</span>
              <span className="text-right">Time</span>
            </div>
            {paginatedVotes.map((vote, i) => (
              <div
                key={i}
                className="row-hover grid grid-cols-[1fr_80px_100px_120px] gap-3 items-center px-5 py-2.5 border-b border-border last:border-0 text-sm"
              >
                <HashLink hash={vote.voter} type="address" />
                <span>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium capitalize ${
                      vote.support === "for"
                        ? "bg-[#22C55E]/10 text-[#22C55E]"
                        : "bg-[#EB5757]/10 text-[#EB5757]"
                    }`}
                  >
                    {vote.support}
                  </span>
                </span>
                <span className="text-right font-mono-data">
                  {vote.weight.toLocaleString()}
                </span>
                <span className="text-right text-xs text-muted-foreground">
                  {new Date(vote.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
        <Pagination
          currentPage={votePage}
          totalPages={voteTotalPages}
          onPageChange={setVotePage}
          pageSize={PAGE_SIZE}
          totalItems={proposalVotes.length}
        />
      </div>

      {/* Execution Details (only for executed proposals) */}
      {isExecutedProposal && execution && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">
            Execution Details
          </h2>
          <div className="rounded-lg bg-card border border-border p-5 space-y-4">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Execution Transaction
                </span>
                <HashLink hash={execution.txHash} type="tx" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Executed At</span>
                <TimeAgo timestamp={execution.executedAt} />
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="text-xs font-medium text-muted-foreground mb-3">
                Changes Applied
              </h3>
              <div className="space-y-2">
                {execution.changes.map((change, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-md bg-secondary px-4 py-2.5"
                  >
                    <span className="font-mono-data text-xs font-medium min-w-[160px]">
                      {change.parameter}
                    </span>
                    <span className="font-mono-data text-xs text-muted-foreground">
                      {change.before}
                    </span>
                    <span className="text-xs text-muted-foreground">&rarr;</span>
                    <span
                      className={`font-mono-data text-xs ${
                        change.before !== change.after
                          ? "text-[#22C55E] font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {change.after}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
