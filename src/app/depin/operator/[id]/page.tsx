"use client";

import Link from "next/link";
import { use, useState, useMemo } from "react";
import { ArrowLeft, Briefcase, Cpu, Users } from "lucide-react";
import { operators, devices } from "@/lib/mock-data";
import { HashLink } from "@/components/hash-link";
import { StatusBadge } from "@/components/status-badge";
import { TimeAgo } from "@/components/time-ago";
import { Pagination } from "@/components/pagination";
import { MobileCard } from "@/components/mobile-card";

const ANCHOR = new Date("2026-04-05T10:00:00.000Z").getTime();
const hour = 3600_000;
const day = 86400_000;
const ts = (offset: number) => new Date(ANCHOR - offset).toISOString();

function getOperator(id: string) {
  return operators.find((o) => o.operatorId === id) ?? operators[0];
}

const uptimeDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, j) => ({
  day: d,
  uptime: (((j * 7919 + 31) % 997) / 997) * 5 + 95,
}));

const recentJobs = Array.from({ length: 5 }, (_, i) => ({
  jobId: `JOB-${(6000 + i).toString()}`,
  description: ["LLM Inference", "Image Classification", "NLP Embedding", "Video Detection", "RAG Indexing"][i],
  reward: ((((i * 7919 + 31) % 997) / 997) * 500 + 50).toFixed(0),
  status: i === 1 ? "proving" : i === 3 ? "assigned" : "completed",
  timestamp: ts(i * day + (((i * 7919 + 31) % 997) / 997) * hour * 6),
}));

const mockDelegators = Array.from({ length: 5 }, (_, i) => ({
  address: `0x${(0x7a00 + i * 0x1234).toString(16).padStart(4, "0")}C9d0E1f2A3b4C5d6E7f8A9b0C1d2E3f4`,
  amount: `${((i + 1) * 2500 + 1000).toLocaleString()} NECTA`,
  date: ts(i * day * 3 + day),
  status: i === 2 ? "pending" : "active" as const,
}));

export default function OperatorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const op = getOperator(id);
  const managedDevices = devices.slice(0, 4);
  const [deviceSearch, setDeviceSearch] = useState("");
  const [delegationPage, setDelegationPage] = useState(1);

  const filteredDevices = useMemo(() => {
    if (!deviceSearch.trim()) return managedDevices;
    const q = deviceSearch.toLowerCase();
    return managedDevices.filter(
      (d) => d.deviceId.toLowerCase().includes(q) || d.owner.toLowerCase().includes(q),
    );
  }, [deviceSearch, managedDevices]);

  const details = [
    { label: "Operator ID", value: <span className="font-mono-data text-primary">{op.operatorId}</span> },
    { label: "Address", value: <HashLink hash={op.address} type="address" /> },
    { label: "Status", value: <StatusBadge status={op.status} /> },
    { label: "Stake", value: <span className="font-mono-data">{Number(op.stake).toLocaleString()} NECTA</span> },
    { label: "Delegations", value: <span className="font-mono-data">{op.delegations}</span> },
    { label: "Uptime", value: <span className={`font-mono-data ${op.uptimePercent > 95 ? "text-[#22C55E]" : "text-[#EB5757]"}`}>{op.uptimePercent.toFixed(1)}%</span> },
    { label: "Jobs Completed", value: <span className="font-mono-data">{op.jobsCompleted.toLocaleString()}</span> },
    { label: "Slashes", value: <span className={`font-mono-data ${op.slashes > 0 ? "text-[#EB5757]" : ""}`}>{op.slashes}</span> },
    { label: "Reputation", value: <span className={`font-mono-data font-medium ${op.reputation > 80 ? "text-[#22C55E]" : "text-[#EB5757]"}`}>{op.reputation}</span> },
  ];

  return (
    <div className="max-w-[1480px] mx-auto px-2.5 py-2 space-y-4">
      <Link href="/depin" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 w-fit">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to DePIN
      </Link>

      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold tracking-tight">Operator {op.operatorId}</h1>
        <StatusBadge status={op.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Operator Info */}
        <div className="lg:col-span-2 rounded-lg bg-card border border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-medium">Operator Information</h2>
          </div>
          {details.map((row) => (
            <div key={row.label} className="flex items-center justify-between px-5 py-2.5 border-b border-border last:border-0">
              <span className="text-sm text-muted-foreground">{row.label}</span>
              <div className="text-right">{row.value}</div>
            </div>
          ))}
        </div>

        {/* Uptime Chart */}
        <div className="rounded-lg bg-card border border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-medium">7-Day Uptime</h2>
          </div>
          <div className="p-5 space-y-2">
            {uptimeDays.map((d) => (
              <div key={d.day} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-8">{d.day}</span>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${d.uptime > 98 ? "bg-[#22C55E]" : "bg-[#FFC933]"}`}
                    style={{ width: `${d.uptime}%` }}
                  />
                </div>
                <span className="text-xs font-mono-data w-12 text-right">{d.uptime.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                    <h2 className="text-sm font-medium">Recent Jobs</h2>
        </div>
        {/* Mobile */}
        <div className="md:hidden space-y-3 p-4">
          {recentJobs.map((job) => (
            <MobileCard
              key={job.jobId}
              rows={[
                { label: "Job", value: <Link href={`/ai-compute/${job.jobId}`} className="font-mono-data text-xs text-primary hover:underline">{job.jobId}</Link> },
                { label: "Description", value: <span className="text-sm">{job.description}</span> },
                { label: "Reward", value: <span className="font-mono-data text-xs">{job.reward} NECTA</span> },
                { label: "Status", value: <StatusBadge status={job.status} /> },
              ]}
            />
          ))}
        </div>
        {/* Desktop */}
        <div className="hidden md:block">
          <div className="grid grid-cols-[100px_1fr_120px_90px_120px] gap-4 px-5 py-2 bg-secondary text-xs text-muted-foreground border-b border-border">
            <span>Job ID</span><span>Description</span><span>Reward</span><span>Status</span><span>Time</span>
          </div>
          {recentJobs.map((job) => (
            <div key={job.jobId} className="row-hover grid grid-cols-[100px_1fr_120px_90px_120px] gap-4 px-5 py-2.5 border-b border-border last:border-0 items-center">
              <Link href={`/ai-compute/${job.jobId}`} className="font-mono-data text-xs text-primary hover:underline">{job.jobId}</Link>
              <span className="text-sm">{job.description}</span>
              <span className="font-mono-data text-xs">{job.reward} NECTA</span>
              <StatusBadge status={job.status} />
              <TimeAgo timestamp={job.timestamp} />
            </div>
          ))}
        </div>
      </div>

      {/* Managed Devices */}
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
                        <h2 className="text-sm font-medium">Managed Devices</h2>
          </div>
          <input
            type="text"
            placeholder="Filter devices..."
            value={deviceSearch}
            onChange={(e) => setDeviceSearch(e.target.value)}
            className="w-48 px-3 py-1.5 rounded-md border border-border bg-secondary text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        {/* Mobile */}
        <div className="md:hidden space-y-3 p-4">
          {filteredDevices.map((d) => (
            <MobileCard
              key={d.deviceId}
              rows={[
                { label: "Device", value: <Link href={`/depin/device/${d.deviceId}`} className="font-mono-data text-xs text-primary hover:underline">{d.deviceId}</Link> },
                { label: "Status", value: <StatusBadge status={d.status} /> },
                { label: "Staked", value: <span className="font-mono-data text-xs">{Number(d.stakedAmount).toLocaleString()}</span> },
                { label: "Uptime", value: <span className={`font-mono-data text-xs ${d.uptime > 95 ? "text-[#22C55E]" : "text-[#EB5757]"}`}>{d.uptime.toFixed(1)}%</span> },
              ]}
            />
          ))}
        </div>
        {/* Desktop */}
        <div className="hidden md:block">
          <div className="grid grid-cols-[100px_1fr_90px_100px_80px] gap-4 px-5 py-2 bg-secondary text-xs text-muted-foreground border-b border-border">
            <span>Device ID</span><span>Owner</span><span>Status</span><span>Staked</span><span>Uptime</span>
          </div>
          {filteredDevices.map((d) => (
            <div key={d.deviceId} className="row-hover grid grid-cols-[100px_1fr_90px_100px_80px] gap-4 px-5 py-2.5 border-b border-border last:border-0 items-center">
              <Link href={`/depin/device/${d.deviceId}`} className="font-mono-data text-xs text-primary hover:underline">{d.deviceId}</Link>
              <HashLink hash={d.owner} type="address" />
              <StatusBadge status={d.status} />
              <span className="font-mono-data text-xs">{Number(d.stakedAmount).toLocaleString()}</span>
              <span className={`font-mono-data text-xs ${d.uptime > 95 ? "text-[#22C55E]" : "text-[#EB5757]"}`}>{d.uptime.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Delegation Management */}
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                    <h2 className="text-sm font-medium">Delegation Management</h2>
        </div>
        {/* Mobile */}
        <div className="md:hidden space-y-3 p-4">
          {mockDelegators.map((d) => (
            <MobileCard
              key={d.address}
              rows={[
                { label: "Address", value: <HashLink hash={d.address} type="address" /> },
                { label: "Amount", value: <span className="font-mono-data text-xs">{d.amount}</span> },
                { label: "Status", value: <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${d.status === "active" ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-[#FFC933]/10 text-[#FFC933]"}`}>{d.status}</span> },
              ]}
            />
          ))}
        </div>
        {/* Desktop */}
        <div className="hidden md:block">
          <div className="grid grid-cols-[1fr_120px_120px_90px] gap-4 px-5 py-2 bg-secondary text-xs text-muted-foreground border-b border-border">
            <span>Address</span>
            <span className="text-right">Amount</span>
            <span>Date</span>
            <span>Status</span>
          </div>
          {mockDelegators.map((d) => (
            <div key={d.address} className="row-hover grid grid-cols-[1fr_120px_120px_90px] gap-4 px-5 py-2.5 border-b border-border last:border-0 items-center">
              <HashLink hash={d.address} type="address" />
              <span className="text-right font-mono-data text-xs">{d.amount}</span>
              <TimeAgo timestamp={d.date} />
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium w-fit ${
                  d.status === "active"
                    ? "bg-[#22C55E]/10 text-[#22C55E]"
                    : "bg-[#FFC933]/10 text-[#FFC933]"
                }`}
              >
                {d.status}
              </span>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-border">
          <Pagination
            currentPage={delegationPage}
            totalPages={1}
            onPageChange={setDelegationPage}
            pageSize={5}
            totalItems={5}
          />
        </div>
      </div>
    </div>
  );
}
