"use client";

import Link from "next/link";
import { use, useState } from "react";
import { ArrowLeft, Shield, HardDrive, Wifi, ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";
import { devices } from "@/lib/mock-data";
import { HashLink } from "@/components/hash-link";
import { StatusBadge } from "@/components/status-badge";
import { TimeAgo } from "@/components/time-ago";
import { MobileCard } from "@/components/mobile-card";

const ANCHOR = new Date("2026-04-05T10:00:00.000Z").getTime();
const hour = 3600_000;
const day = 86400_000;
const ts = (offset: number) => new Date(ANCHOR - offset).toISOString();

function getDevice(id: string) {
  return devices.find((d) => d.deviceId === id) ?? devices[0];
}

const mockAttestations = Array.from({ length: 5 }, (_, i) => ({
  id: `ATT-${(8000 + i).toString()}`,
  timestamp: ts(i * day + (((i * 7919 + 31) % 997) / 997) * hour * 4),
  verifier: `0x${(0x2b3c + i * 0x18).toString(16).padStart(4, "0")}A7b8C9d0E1f2A3b4C5d6E7f8A9b0C1d2`,
  proofType: i % 2 === 0 ? "zk" : "enclave",
  status: i === 3 ? "pending" : "verified",
  proofHash: `0x${(0xa1b2 + i * 0x1111).toString(16).padStart(8, "0")}c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0`,
  verifierSignature: `0x${(0xf0e1 + i * 0x2222).toString(16).padStart(8, "0")}d2c3b4a5968778695a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3`,
  verifiedAt: ts(i * day + (((i * 7919 + 31) % 997) / 997) * hour * 3),
}));

const hardwareSpecs = {
  gpu: "NVIDIA RTX 4090 24GB",
  cpu: "AMD EPYC 7543 32-Core",
  ram: "128 GB DDR5 ECC",
  storage: "4 TB NVMe SSD",
  network: "10 Gbps Ethernet",
};

export default function DeviceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const device = getDevice(id);

  const details = [
    { label: "Device ID", value: <span className="font-mono-data text-primary">{device.deviceId}</span> },
    { label: "Fingerprint", value: <span className="font-mono-data text-xs break-all">{device.fingerprint}</span> },
    { label: "Owner", value: <HashLink hash={device.owner} type="address" /> },
    { label: "Status", value: <StatusBadge status={device.status} /> },
    { label: "Staked", value: <span className="font-mono-data">{Number(device.stakedAmount).toLocaleString()} NECTA</span> },
    { label: "Uptime", value: <span className={`font-mono-data ${device.uptime > 95 ? "text-[#22C55E]" : device.uptime > 80 ? "text-[#EB5757]" : "text-[#EB5757]"}`}>{device.uptime.toFixed(1)}%</span> },
    { label: "Metadata URI", value: <span className="font-mono-data text-xs text-muted-foreground">{device.metadataURI}</span> },
    { label: "Attestations", value: <span className="font-mono-data">{device.attestationCount}</span> },
  ];

  return (
    <div className="max-w-[1480px] mx-auto px-2.5 py-2 space-y-4">
      <Link href="/depin" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 w-fit">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to DePIN
      </Link>

      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold tracking-tight">Device {device.deviceId}</h1>
        <StatusBadge status={device.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Device Info */}
        <div className="lg:col-span-2 rounded-lg bg-card border border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-medium">Device Information</h2>
          </div>
          {details.map((row) => (
            <div key={row.label} className="flex items-center justify-between px-5 py-2.5 border-b border-border last:border-0">
              <span className="text-sm text-muted-foreground">{row.label}</span>
              <div className="text-right">{row.value}</div>
            </div>
          ))}
        </div>

        {/* Hardware Specs */}
        <div className="rounded-lg bg-card border border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-muted-foreground" /> Hardware Specs
            </h2>
          </div>
          {Object.entries(hardwareSpecs).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between px-5 py-2.5 border-b border-border last:border-0">
              <span className="text-sm text-muted-foreground capitalize">{key}</span>
              <span className="font-mono-data text-xs">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Attestation History */}
      <AttestationHistory />
    </div>
  );
}

function AttestationHistory() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="rounded-lg bg-card border border-border overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                <h2 className="text-sm font-medium">Attestation History</h2>
      </div>
      {/* Mobile */}
      <div className="md:hidden space-y-3 p-4">
        {mockAttestations.map((att) => (
          <div key={att.id}>
            <MobileCard
              onClick={() => toggle(att.id)}
              rows={[
                { label: "ID", value: <span className="font-mono-data text-xs">{att.id}</span> },
                { label: "Proof", value: <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${att.proofType === "zk" ? "bg-[#6E9FFF]/10 text-[#6E9FFF]" : "bg-[#6E9FFF]/10 text-[#6E9FFF]"}`}>{att.proofType}</span> },
                { label: "Status", value: <StatusBadge status={att.status} /> },
                { label: "Time", value: <TimeAgo timestamp={att.timestamp} /> },
              ]}
            />
            {expanded[att.id] && (
              <div className="px-4 py-3 bg-muted rounded-b-lg space-y-2 -mt-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Verifier</p>
                <HashLink hash={att.verifier} type="address" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-2">Proof Hash</p>
                <p className="font-mono-data text-xs break-all">{att.proofHash}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Desktop */}
      <div className="hidden md:block">
        <div className="grid grid-cols-[24px_100px_1fr_100px_90px_120px] gap-4 px-5 py-2 bg-secondary text-xs text-muted-foreground border-b border-border">
          <span />
          <span>ID</span>
          <span>Verifier</span>
          <span>Proof Type</span>
          <span>Status</span>
          <span>Time</span>
        </div>
        {mockAttestations.map((att) => (
          <div key={att.id}>
            <div
              onClick={() => toggle(att.id)}
              className="row-hover cursor-pointer grid grid-cols-[24px_100px_1fr_100px_90px_120px] gap-4 px-5 py-2.5 border-b border-border items-center"
            >
              <span className="text-muted-foreground">
                {expanded[att.id] ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </span>
              <span className="font-mono-data text-xs">{att.id}</span>
              <HashLink hash={att.verifier} type="address" />
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium w-fit ${
                  att.proofType === "zk"
                    ? "bg-[#6E9FFF]/10 text-[#6E9FFF]"
                    : "bg-[#6E9FFF]/10 text-[#6E9FFF]"
                }`}
              >
                {att.proofType}
              </span>
              <StatusBadge status={att.status} />
              <TimeAgo timestamp={att.timestamp} />
            </div>
            {expanded[att.id] && (
              <div className="px-5 py-4 border-b border-border bg-muted space-y-3">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Attestation Verification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                      Proof Hash
                    </p>
                    <p className="font-mono-data text-xs break-all">{att.proofHash}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                      Verifier Signature
                    </p>
                    <p className="font-mono-data text-xs break-all">
                      {att.verifierSignature}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                      Verification Timestamp
                    </p>
                    <TimeAgo timestamp={att.verifiedAt} />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                      Status
                    </p>
                    {att.status === "verified" ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#22C55E]/10 text-[#22C55E]">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified on-chain
                      </span>
                    ) : (
                      <StatusBadge status={att.status} />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
