"use client";

import { useRouter } from "next/navigation";
import { Bot, Zap, CheckCircle, Clock, ArrowUpRight, ArrowDownRight, Plus } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { HashLink } from "@/components/hash-link";
import { StatusBadge } from "@/components/status-badge";
import { TimeAgo } from "@/components/time-ago";
import { Pagination } from "@/components/pagination";
import { MobileCard } from "@/components/mobile-card";
import { SortableHeader } from "@/components/sortable-header";
import Link from "next/link";
import { PageTitle } from "@/components/page-title";
import { aiJobs } from "@/lib/mock-data";
import { useMemo, useState, useEffect } from "react";

const proofStyles: Record<string, string> = {
  deterministic: "border border-border text-muted-foreground",
  enclave: "border border-border text-muted-foreground",
  zk: "border border-[#6E9FFF]/30 text-[#6E9FFF] bg-[#6E9FFF]/5",
};

type JobFilter = "all" | "open" | "active" | "completed" | "disputed";

const PAGE_SIZE = 25;

type JobSortKey = "jobId" | "reward" | "createdAt" | "status";

export default function AIComputePage() {
  const router = useRouter();
  const [jobPage, setJobPage] = useState(1);
  const [filter, setFilter] = useState<JobFilter>("all");
  const [sort, setSort] = useState<{ key: JobSortKey; dir: "asc" | "desc" }>({
    key: "createdAt",
    dir: "desc",
  });

  // Filter persistence — load on mount, save on change
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("ai-jobs-filter") : null;
    if (saved && ["all", "open", "active", "completed", "disputed"].includes(saved)) {
      setFilter(saved as JobFilter);
    }
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("ai-jobs-filter", filter);
  }, [filter]);

  const completed = aiJobs.filter((j) => j.status === "completed").length;
  const totalRewards = aiJobs
    .filter((j) => j.status === "completed")
    .reduce((s, j) => s + parseInt(j.reward), 0);

  // Pipeline counts
  const pipeline = {
    posted: aiJobs.filter((j) => j.status === "posted").length,
    bidding: aiJobs.filter((j) => j.status === "bidding").length,
    assigned: aiJobs.filter((j) => j.status === "assigned").length,
    proving: aiJobs.filter((j) => j.status === "proving").length,
    completed: aiJobs.filter((j) => j.status === "completed").length,
  };

  const openJobs = pipeline.posted + pipeline.bidding;
  const disputedCount = aiJobs.filter((j) => j.status === "disputed").length;

  // Median reward (price anchor for posters)
  const medianReward = useMemo(() => {
    const sorted = aiJobs
      .filter((j) => j.status === "completed")
      .map((j) => parseInt(j.reward))
      .sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)] || 0;
  }, []);

  // Pipeline stages with derived flow rates.
  // Flow = baseline derived from stage count + deterministic seed offset.
  // The "hot" stage = whichever currently has the largest queue.
  const pipelineSteps = useMemo(() => {
    const stages = [
      { label: "Posted", count: pipeline.posted },
      { label: "Bidding", count: pipeline.bidding },
      { label: "Assigned", count: pipeline.assigned },
      { label: "Proving", count: pipeline.proving },
      { label: "Completed", count: pipeline.completed },
    ];
    const hotStage = stages.reduce((max, s) => (s.count > max.count ? s : max), stages[0]);
    return stages.map((s, i) => ({
      ...s,
      flow: s.count > 0 ? `+${Math.max(1, s.count * 2 + i)} today` : "no flow",
      trend: (s.count > 0 ? "up" : "down") as "up" | "down",
      hot: s.label === hotStage.label && hotStage.count > 0,
    }));
  }, [pipeline.posted, pipeline.bidding, pipeline.assigned, pipeline.proving, pipeline.completed]);

  const filteredJobs = useMemo(() => {
    const base = (() => {
      switch (filter) {
        case "open":
          return aiJobs.filter((j) => j.status === "posted" || j.status === "bidding");
        case "active":
          return aiJobs.filter((j) => j.status === "assigned" || j.status === "proving");
        case "completed":
          return aiJobs.filter((j) => j.status === "completed");
        case "disputed":
          return aiJobs.filter((j) => j.status === "disputed");
        default:
          return aiJobs;
      }
    })();
    const sorted = [...base].sort((a, b) => {
      const k = sort.key;
      const av = k === "reward" ? parseInt(a.reward) : (a[k] as string | number);
      const bv = k === "reward" ? parseInt(b.reward) : (b[k] as string | number);
      const cmp = typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [filter, sort]);

  const toggleSort = (key: JobSortKey) =>
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" },
    );

  const jobTotalPages = Math.ceil(filteredJobs.length / PAGE_SIZE);
  const paginatedJobs = filteredJobs.slice(
    (jobPage - 1) * PAGE_SIZE,
    jobPage * PAGE_SIZE,
  );

  const filterCounts: Record<JobFilter, number> = {
    all: aiJobs.length,
    open: openJobs,
    active: pipeline.assigned + pipeline.proving,
    completed: pipeline.completed,
    disputed: disputedCount,
  };

  return (
    <div className="max-w-[1480px] mx-auto px-2.5 py-2 space-y-4">
      <PageTitle title="AI Compute" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">AI Compute Network</h1>
        <button className="n-btn n-btn--primary n-btn--sm flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Post a job
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Open Jobs"
          value={openJobs.toString()}
          change="+5"
          trend="up"
          icon={Clock}
        />
        <StatCard
          title="Active"
          value={(pipeline.assigned + pipeline.proving).toString()}
          change="+3"
          trend="up"
          icon={Bot}
        />
        <StatCard
          title="Completed"
          value={completed.toString()}
          change="+18"
          trend="up"
          icon={CheckCircle}
        />
        <StatCard
          title="Rewards Paid"
          value={`${(totalRewards / 1000).toFixed(0)}K`}
          change="+12%"
          trend="up"
          icon={Zap}
        />
      </div>

      {/* Job Pipeline — the signature visual */}
      <div className="rounded-lg bg-card border border-border p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-medium">Job Pipeline</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Live flow of compute jobs through the marketplace lifecycle · median reward{" "}
              <span className="font-mono-data text-foreground">{medianReward.toLocaleString()} NECTA</span>
            </p>
          </div>
          <span className="text-[10px] text-muted-foreground hidden sm:block">
            Updated 12s ago
          </span>
        </div>

        {/* Pipeline steps with flow indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {pipelineSteps.map((step, i) => (
            <div key={step.label} className="relative">
              <div
                className={`rounded-lg border p-4 transition-all ${
                  step.hot
                    ? "border-[#FFC933]/40 bg-[#FFC933]/5"
                    : "border-border bg-secondary/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] uppercase tracking-[0.06em] font-medium ${
                      step.hot ? "text-[#FFC933]" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                  {step.hot && (
                    <span className="text-[9px] uppercase tracking-[0.06em] text-[#FFC933] font-semibold">
                      Hot
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-[24px] font-mono-data font-semibold tabular-nums leading-none ${
                      step.hot ? "text-[#FFC933]" : "text-foreground"
                    }`}
                  >
                    {step.count}
                  </span>
                  <span className="text-[11px] text-muted-foreground">jobs</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[10px]">
                  {step.trend === "up" ? (
                    <ArrowUpRight className="h-3 w-3 text-[#22C55E]" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-[#EB5757]" />
                  )}
                  <span
                    className={
                      step.trend === "up" ? "text-[#22C55E]" : "text-[#EB5757]"
                    }
                  >
                    {step.flow}
                  </span>
                </div>
              </div>
              {/* Connector arrow — desktop only */}
              {i < pipelineSteps.length - 1 && (
                <div className="hidden lg:flex absolute top-1/2 -right-2 -translate-y-1/2 h-px w-3 bg-border z-10 items-center justify-end">
                  <span className="text-muted-foreground text-[10px] -mr-0.5">›</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Jobs Table — with filter chips */}
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-b border-border">
          <div className="flex items-center gap-2 flex-wrap">
            {(
              [
                { id: "all", label: "All" },
                { id: "open", label: "Open" },
                { id: "active", label: "In Progress" },
                { id: "completed", label: "Completed" },
                { id: "disputed", label: "Disputed" },
              ] as { id: JobFilter; label: string }[]
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setFilter(f.id);
                  setJobPage(1);
                }}
                className={`px-2.5 py-1 text-[11px] rounded-md border transition-colors ${
                  filter === f.id
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {f.label}{" "}
                <span className="font-mono-data tabular-nums opacity-60">
                  {filterCounts[f.id]}/{aiJobs.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {paginatedJobs.length === 0 && (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No jobs match this filter.
            </p>
            <button
              onClick={() => setFilter("all")}
              className="mt-2 text-[11px] text-primary hover:underline"
            >
              Clear filter
            </button>
          </div>
        )}

        {paginatedJobs.length > 0 && (
          <>
            <div className="hidden md:block">
              <div className="grid grid-cols-[70px_1fr_1fr_1fr_80px_70px_100px_90px] gap-3 px-5 py-2.5 border-b border-border text-[10px] text-muted-foreground uppercase tracking-[0.06em]">
                <SortableHeader label="Job" sortKey="jobId" currentSort={sort.key} direction={sort.dir} onSort={(k) => toggleSort(k as JobSortKey)} />
                <span>Description</span>
                <span>Poster</span>
                <span>Worker</span>
                <SortableHeader label="Status" sortKey="status" currentSort={sort.key} direction={sort.dir} onSort={(k) => toggleSort(k as JobSortKey)} />
                <span>Proof</span>
                <div className="text-right">
                  <SortableHeader label="Reward" sortKey="reward" currentSort={sort.key} direction={sort.dir} onSort={(k) => toggleSort(k as JobSortKey)} />
                </div>
                <div className="text-right">
                  <SortableHeader label="Created" sortKey="createdAt" currentSort={sort.key} direction={sort.dir} onSort={(k) => toggleSort(k as JobSortKey)} />
                </div>
              </div>
              {paginatedJobs.map((job) => (
                <div
                  key={job.jobId}
                  className="grid grid-cols-[70px_1fr_1fr_1fr_80px_70px_100px_90px] gap-3 items-center px-5 py-2.5 border-b border-border last:border-0 text-sm hover:bg-secondary/30 transition-colors"
                >
                  <Link
                    href={`/ai-compute/${job.jobId}`}
                    className="font-mono-data text-primary hover:underline text-xs"
                  >
                    {job.jobId}
                  </Link>
                  <span className="truncate text-sm">{job.description}</span>
                  <HashLink hash={job.poster} type="address" />
                  <span>
                    {job.worker ? (
                      <HashLink hash={job.worker} type="address" />
                    ) : (
                      <span className="text-xs text-[#22C55E]">
                        Open for bids
                      </span>
                    )}
                  </span>
                  <StatusBadge status={job.status} />
                  <span
                    className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-[0.04em] ${proofStyles[job.proofType]}`}
                  >
                    {job.proofType}
                  </span>
                  <span className="text-right font-mono-data tabular-nums">
                    {parseInt(job.reward).toLocaleString()}
                    <span className="text-[10px] text-muted-foreground ml-1">NECTA</span>
                  </span>
                  <span className="text-right">
                    <TimeAgo timestamp={job.createdAt} />
                  </span>
                </div>
              ))}
            </div>
            <div className="md:hidden p-3 space-y-3">
              {paginatedJobs.map((job) => (
                <MobileCard
                  key={job.jobId}
                  onClick={() => router.push(`/ai-compute/${job.jobId}`)}
                  rows={[
                    {
                      label: "Job ID",
                      value: <span className="font-mono-data text-primary">{job.jobId}</span>,
                    },
                    { label: "Status", value: <StatusBadge status={job.status} /> },
                    {
                      label: "Proof",
                      value: (
                        <span
                          className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${proofStyles[job.proofType]}`}
                        >
                          {job.proofType}
                        </span>
                      ),
                    },
                    {
                      label: "Reward",
                      value: (
                        <span className="font-mono-data">
                          {parseInt(job.reward).toLocaleString()} NECTA
                        </span>
                      ),
                    },
                  ]}
                />
              ))}
            </div>
            <div className="px-5 py-3 border-t border-border">
              <Pagination
                currentPage={jobPage}
                totalPages={jobTotalPages}
                onPageChange={setJobPage}
                pageSize={PAGE_SIZE}
                totalItems={filteredJobs.length}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
