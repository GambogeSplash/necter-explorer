"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cpu, Radio, Shield, Activity } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { HashLink } from "@/components/hash-link";
import { StatusBadge } from "@/components/status-badge";
import { Pagination } from "@/components/pagination";
import { MobileCard } from "@/components/mobile-card";
import { devices, operators, stakeDistribution } from "@/lib/mock-data";
import { PageTitle } from "@/components/page-title";
import { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const attestationTimeline = [
  { day: "Mon", count: 847 },
  { day: "Tue", count: 1023 },
  { day: "Wed", count: 932 },
  { day: "Thu", count: 1105 },
  { day: "Fri", count: 889 },
  { day: "Sat", count: 764 },
  { day: "Sun", count: 956 },
];

const tooltipStyle = {
  backgroundColor: "#131315",
  border: "1px solid rgba(255,245,230,0.07)",
  borderRadius: 8,
  fontSize: 12,
  color: "#F9F9F6",
};

const PAGE_SIZE = 25;

export default function DePINPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"devices" | "operators">("devices");
  const [devicePage, setDevicePage] = useState(1);
  const [operatorPage, setOperatorPage] = useState(1);
  const [search, setSearch] = useState("");

  const activeDevices = devices.filter((d) => d.status === "active").length;
  const activeOperators = operators.filter((o) => o.status === "active").length;
  const totalStaked = operators.reduce((sum, o) => sum + parseInt(o.stake), 0);
  const avgUptime =
    operators.reduce((sum, o) => sum + o.uptimePercent, 0) / operators.length;

  const filteredDevices = useMemo(() => {
    if (!search.trim()) return devices;
    const q = search.toLowerCase();
    return devices.filter(
      (d) => d.deviceId.toLowerCase().includes(q) || d.owner.toLowerCase().includes(q),
    );
  }, [search]);

  const filteredOperators = useMemo(() => {
    if (!search.trim()) return operators;
    const q = search.toLowerCase();
    return operators.filter(
      (o) => o.operatorId.toLowerCase().includes(q) || o.address.toLowerCase().includes(q),
    );
  }, [search]);

  const deviceTotalPages = Math.ceil(filteredDevices.length / PAGE_SIZE);
  const operatorTotalPages = Math.ceil(filteredOperators.length / PAGE_SIZE);
  const paginatedDevices = filteredDevices.slice(
    (devicePage - 1) * PAGE_SIZE,
    devicePage * PAGE_SIZE,
  );
  const paginatedOperators = filteredOperators.slice(
    (operatorPage - 1) * PAGE_SIZE,
    operatorPage * PAGE_SIZE,
  );

  return (
    <div className="px-2.5 py-2 space-y-4">
      <PageTitle title="DePIN" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            DePIN & Hardware Staking
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
          </p>
        </div>
        
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total Devices"
          value={devices.length.toString()}
          change="+12"
          trend="up"
          icon={Cpu}
        />
        <StatCard
          title="Active Operators"
          value={activeOperators.toString()}
          change="+3"
          trend="up"
          icon={Radio}
        />
        <StatCard
          title="Total Staked"
          value={`${(totalStaked / 1000).toFixed(0)}K`}
          change="+8.2%"
          trend="up"
          icon={Shield}
        />
        <StatCard
          title="Avg Uptime"
          value={`${avgUptime.toFixed(1)}%`}
          icon={Activity}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Stake Distribution Pie */}
        <div className="rounded-lg bg-card border border-border p-5">
          <p className="text-xs text-muted-foreground mb-4">
            Stake Distribution
          </p>
          <div className="chart-reveal">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={stakeDistribution}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                paddingAngle={2}
              >
                {stakeDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={((v: number) => [
                  `${(v / 1_000_000).toFixed(2)}M NECTA`,
                  "Staked",
                ]) as never}
              />
            </PieChart>
          </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {stakeDistribution.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                {s.label}
              </div>
            ))}
          </div>
        </div>

        {/* Attestation Timeline */}
        <div className="rounded-lg bg-card border border-border p-5">
          <p className="text-xs text-muted-foreground mb-4">
            Attestation Timeline (7d)
          </p>
          <div className="chart-reveal">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={attestationTimeline}>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "#777470" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#777470" }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar
                dataKey="count"
                fill="#22C55E"
                radius={[4, 4, 0, 0]}
                name="Attestations"
              />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search devices or operators by ID..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setDevicePage(1);
            setOperatorPage(1);
          }}
          className="w-full max-w-md px-3 py-2 rounded-lg bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Tab switcher */}
      <div className="n-tabbar">
        <button
          onClick={() => {
            setTab("devices");
            setDevicePage(1);
          }}
          className={`n-tabbar-btn ${tab === "devices" ? "n-tabbar-btn--active" : ""}`}
        >
          Devices ({filteredDevices.length})
        </button>
        <button
          onClick={() => {
            setTab("operators");
            setOperatorPage(1);
          }}
          className={`n-tabbar-btn ${tab === "operators" ? "n-tabbar-btn--active" : ""}`}
        >
          Operators ({filteredOperators.length})
        </button>
      </div>

      {tab === "devices" && (
        <div className="animate-fadeIn space-y-4" key="devices">
          <div className="hidden md:block rounded-lg bg-card border border-border overflow-hidden row-stagger">
            <div className="grid grid-cols-[80px_1fr_1fr_80px_80px_80px_120px] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
              <span>ID</span>
              <span>Fingerprint</span>
              <span>Owner</span>
              <span className="text-right">Attest.</span>
              <span>Status</span>
              <span className="text-right">Staked</span>
              <span>Uptime</span>
            </div>
            {paginatedDevices.map((d) => (
              <div
                key={d.deviceId}
                className="row-hover grid grid-cols-[80px_1fr_1fr_80px_80px_80px_120px] gap-3 items-center px-5 py-2.5 border-b border-border last:border-0 text-sm"
              >
                <Link
                  href={`/depin/device/${d.deviceId}`}
                  className="font-mono-data font-medium text-primary hover:underline"
                >
                  {d.deviceId}
                </Link>
                <HashLink hash={d.fingerprint} type="tx" />
                <HashLink hash={d.owner} type="address" />
                <span className="text-right font-mono-data text-muted-foreground">
                  {d.attestationCount}
                </span>
                <StatusBadge status={d.status} />
                <span className="text-right font-mono-data">
                  {parseInt(d.stakedAmount).toLocaleString()}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-1 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bar-fill ${d.uptime > 95 ? "bg-[#22C55E]" : d.uptime > 80 ? "bg-[#F2994A]" : "bg-[#EB5757]"}`}
                      style={{ width: `${d.uptime}%` }}
                    />
                  </div>
                  <span className="font-mono-data text-xs text-muted-foreground">
                    {d.uptime.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="md:hidden space-y-3">
            {paginatedDevices.map((d) => (
              <MobileCard
                key={d.deviceId}
                onClick={() => router.push(`/depin/device/${d.deviceId}`)}
                rows={[
                  { label: "Device ID", value: <span className="font-mono-data text-primary">{d.deviceId}</span> },
                  { label: "Status", value: <StatusBadge status={d.status} /> },
                  { label: "Staked", value: <span className="font-mono-data">{parseInt(d.stakedAmount).toLocaleString()}</span> },
                  { label: "Uptime", value: <span className="font-mono-data">{d.uptime.toFixed(1)}%</span> },
                ]}
              />
            ))}
          </div>
          <Pagination
            currentPage={devicePage}
            totalPages={deviceTotalPages}
            onPageChange={setDevicePage}
            pageSize={PAGE_SIZE}
            totalItems={filteredDevices.length}
          />
        </div>
      )}

      {tab === "operators" && (
        <div className="animate-fadeIn space-y-4" key="operators">
          <div className="hidden md:block rounded-lg bg-card border border-border overflow-hidden row-stagger">
            <div className="grid grid-cols-[70px_1fr_100px_70px_120px_80px_60px_80px] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
              <span>ID</span>
              <span>Address</span>
              <span className="text-right">Stake</span>
              <span className="text-right">Deleg.</span>
              <span>Uptime</span>
              <span className="text-right">Jobs</span>
              <span className="text-right">Slash</span>
              <span>Rep.</span>
            </div>
            {paginatedOperators.map((op) => (
              <div
                key={op.operatorId}
                className="row-hover grid grid-cols-[70px_1fr_100px_70px_120px_80px_60px_80px] gap-3 items-center px-5 py-2.5 border-b border-border last:border-0 text-sm"
              >
                <Link
                  href={`/depin/operator/${op.operatorId}`}
                  className="font-mono-data font-medium text-primary hover:underline"
                >
                  {op.operatorId}
                </Link>
                <HashLink hash={op.address} type="address" />
                <span className="text-right font-mono-data">
                  {parseInt(op.stake).toLocaleString()}
                </span>
                <span className="text-right font-mono-data text-muted-foreground">
                  {op.delegations}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-1 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bar-fill ${op.uptimePercent > 95 ? "bg-[#22C55E]" : op.uptimePercent > 80 ? "bg-[#F2994A]" : "bg-[#EB5757]"}`}
                      style={{ width: `${Math.min(op.uptimePercent, 100)}%` }}
                    />
                  </div>
                  <span className="font-mono-data text-xs text-muted-foreground">
                    {op.uptimePercent.toFixed(1)}%
                  </span>
                </div>
                <span className="text-right font-mono-data text-muted-foreground">
                  {op.jobsCompleted.toLocaleString()}
                </span>
                <span
                  className={`text-right font-mono-data ${op.slashes > 0 ? "text-[#EB5757]" : "text-muted-foreground"}`}
                >
                  {op.slashes}
                </span>
                <span
                  className={`font-mono-data font-medium ${op.reputation > 80 ? "text-[#22C55E]" : op.reputation > 50 ? "text-[#F2994A]" : "text-[#EB5757]"}`}
                >
                  {op.reputation}/100
                </span>
              </div>
            ))}
          </div>
          <div className="md:hidden space-y-3">
            {paginatedOperators.map((op) => (
              <MobileCard
                key={op.operatorId}
                onClick={() => router.push(`/depin/operator/${op.operatorId}`)}
                rows={[
                  { label: "Operator ID", value: <span className="font-mono-data text-primary">{op.operatorId}</span> },
                  { label: "Reputation", value: <span className={`font-mono-data font-medium ${op.reputation > 80 ? "text-[#22C55E]" : op.reputation > 50 ? "text-[#F2994A]" : "text-[#EB5757]"}`}>{op.reputation}/100</span> },
                  { label: "Uptime", value: <span className="font-mono-data">{op.uptimePercent.toFixed(1)}%</span> },
                  { label: "Jobs", value: <span className="font-mono-data">{op.jobsCompleted.toLocaleString()}</span> },
                ]}
              />
            ))}
          </div>
          <Pagination
            currentPage={operatorPage}
            totalPages={operatorTotalPages}
            onPageChange={setOperatorPage}
            pageSize={PAGE_SIZE}
            totalItems={filteredOperators.length}
          />
        </div>
      )}
    </div>
  );
}
