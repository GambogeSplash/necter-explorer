"use client";

import { useRouter } from "next/navigation";
import { Bot, Zap, CheckCircle, Clock } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { HashLink } from "@/components/hash-link";
import { StatusBadge } from "@/components/status-badge";
import { TimeAgo } from "@/components/time-ago";
import { Pagination } from "@/components/pagination";
import { MobileCard } from "@/components/mobile-card";
import { GaugeChart } from "@/components/gauge-chart";
import Link from "next/link";
import { PageTitle } from "@/components/page-title";
import { aiJobs } from "@/lib/mock-data";
import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const proofStyles: Record<string, string> = {
  deterministic: "bg-secondary text-muted-foreground",
  enclave: "bg-[#9985FF]/10 text-[#9985FF]",
  zk: "bg-[#9985FF]/10 text-[#9985FF]",
};

const tooltipStyle = {
  backgroundColor: "#131315",
  border: "1px solid rgba(255,245,230,0.07)",
  borderRadius: 8,
  fontSize: 12,
  color: "#F9F9F6",
};

const verificationData = [
  { name: "Verified", value: 87, color: "#22C55E" },
  { name: "Pending", value: 8, color: "#F2994A" },
  { name: "Failed", value: 5, color: "#EB5757" },
];

const PAGE_SIZE = 25;

export default function AIComputePage() {
  const router = useRouter();
  const [jobPage, setJobPage] = useState(1);

  const completed = aiJobs.filter((j) => j.status === "completed").length;
  const active = aiJobs.filter(
    (j) => !["completed", "disputed"].includes(j.status),
  ).length;
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

  const pipelineSteps = [
    { label: "Posted", count: pipeline.posted, color: "#F2994A" },
    { label: "Bidding", count: pipeline.bidding, color: "#F2994A" },
    { label: "Assigned", count: pipeline.assigned, color: "#6E9FFF" },
    { label: "Proving", count: pipeline.proving, color: "#9985FF" },
    { label: "Completed", count: pipeline.completed, color: "#22C55E" },
  ];

  const jobTotalPages = Math.ceil(aiJobs.length / PAGE_SIZE);
  const paginatedJobs = aiJobs.slice(
    (jobPage - 1) * PAGE_SIZE,
    jobPage * PAGE_SIZE,
  );

  return (
    <div className="px-2.5 py-2 space-y-4">
      <PageTitle title="AI Compute" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            AI Compute Marketplace
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Job lifecycle, proof verification, and payouts
          </p>
        </div>
        
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Active Jobs"
          value={active.toString()}
          change="+5"
          trend="up"
          icon={Clock}
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
        <StatCard title="Avg Completion" value="4.2h" icon={Bot} />
      </div>

      {/* Job Pipeline Visualization */}
      <div className="rounded-lg bg-card border border-border p-5">
        <p className="text-xs text-muted-foreground mb-4">Job Pipeline</p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {pipelineSteps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 rounded-full px-4 py-2${step.label === "Proving" ? " pipeline-active" : ""}`}
                style={{ backgroundColor: `${step.color}15`, border: `1px solid ${step.color}40`, color: step.label === "Proving" ? step.color : undefined }}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: step.color }}
                />
                <span className="text-sm font-medium" style={{ color: step.color }}>
                  {step.label}
                </span>
                <span
                  className="text-sm font-semibold font-mono-data"
                  style={{ color: step.color }}
                >
                  {step.count}
                </span>
              </div>
              {i < pipelineSteps.length - 1 && (
                <span className="text-muted-foreground text-lg select-none">
                  &rarr;
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Proof Verification Rate */}
        <div className="rounded-lg bg-card border border-border p-5">
          <p className="text-xs text-muted-foreground mb-4">
            Proof Verification Rate
          </p>
          <div className="flex items-center justify-center">
            <div className="chart-reveal w-full">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={verificationData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {verificationData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={((v: number) => [`${v}%`, ""]) as never}
                />
              </PieChart>
            </ResponsiveContainer>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {verificationData.map((d, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
              >
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                {d.name} ({d.value}%)
              </div>
            ))}
          </div>
        </div>

        {/* Compute Utilization Gauge */}
        <div className="rounded-lg bg-card border border-border p-5 flex flex-col items-center justify-center">
          <p className="text-xs text-muted-foreground mb-4 self-start">
            Compute Utilization
          </p>
          <GaugeChart value={73} label="Compute Utilization" color="#FFC933" size={200} />
        </div>
      </div>

      {/* Jobs Table */}
      <div className="space-y-4">
        <div className="hidden md:block rounded-lg bg-card border border-border overflow-hidden">
          <div className="grid grid-cols-[70px_1fr_1fr_1fr_80px_70px_80px_90px] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
            <span>Job</span>
            <span>Description</span>
            <span>Poster</span>
            <span>Worker</span>
            <span>Status</span>
            <span>Proof</span>
            <span className="text-right">Reward</span>
            <span className="text-right">Created</span>
          </div>
          {paginatedJobs.map((job) => (
            <div
              key={job.jobId}
              className="row-hover grid grid-cols-[70px_1fr_1fr_1fr_80px_70px_80px_90px] gap-3 items-center px-5 py-2.5 border-b border-border last:border-0 text-sm"
            >
              <Link
                href={`/ai-compute/${job.jobId}`}
                className="font-mono-data text-foreground hover:text-primary transition-colors text-xs"
              >
                {job.jobId}
              </Link>
              <span className="truncate text-sm">{job.description}</span>
              <HashLink hash={job.poster} type="address" />
              <span>
                {job.worker ? (
                  <HashLink hash={job.worker} type="address" />
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Unassigned
                  </span>
                )}
              </span>
              <StatusBadge status={job.status} />
              <span
                className={`inline-flex px-1.5 py-0.5 rounded-md text-[10px] font-medium capitalize ${proofStyles[job.proofType]}`}
              >
                {job.proofType}
              </span>
              <span className="text-right font-mono-data">
                {parseInt(job.reward).toLocaleString()}
              </span>
              <span className="text-right">
                <TimeAgo timestamp={job.createdAt} />
              </span>
            </div>
          ))}
        </div>
        <div className="md:hidden space-y-3">
          {paginatedJobs.map((job) => (
            <MobileCard
              key={job.jobId}
              onClick={() => router.push(`/ai-compute/${job.jobId}`)}
              rows={[
                { label: "Job ID", value: <span className="font-mono-data text-primary">{job.jobId}</span> },
                { label: "Status", value: <StatusBadge status={job.status} /> },
                { label: "Proof Type", value: <span className={`inline-flex px-1.5 py-0.5 rounded-md text-[10px] font-medium capitalize ${proofStyles[job.proofType]}`}>{job.proofType}</span> },
                { label: "Reward", value: <span className="font-mono-data">{parseInt(job.reward).toLocaleString()}</span> },
              ]}
            />
          ))}
        </div>
        <Pagination
          currentPage={jobPage}
          totalPages={jobTotalPages}
          onPageChange={setJobPage}
          pageSize={PAGE_SIZE}
          totalItems={aiJobs.length}
        />
      </div>
    </div>
  );
}
