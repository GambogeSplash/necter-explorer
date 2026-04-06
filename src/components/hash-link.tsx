"use client";

import Link from "next/link";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { getAddressAvatar } from "@/lib/avatar";
import { showToast } from "@/components/toast";

interface HashLinkProps {
  hash: string;
  type: "tx" | "block" | "address";
  truncate?: boolean;
}

function truncateHash(hash: string) {
  if (hash.length <= 14) return hash;
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

export function HashLink({ hash, type, truncate = true }: HashLinkProps) {
  const [copied, setCopied] = useState(false);

  const href =
    type === "tx" ? `/tx/${hash}` : type === "block" ? `/blocks/${hash}` : `/address/${hash}`;

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(hash);
    setCopied(true);
    showToast(type === "address" ? "Address copied to clipboard" : "Hash copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <span className="inline-flex items-center gap-1 group">
      {type === "address" && (
        <img src={getAddressAvatar(hash)} alt="" className="h-4 w-4 rounded-sm shrink-0" />
      )}
      <Link
        href={href}
        className="font-mono-data text-foreground hover:text-primary transition-colors underline decoration-border underline-offset-[3px] hover:decoration-primary"
      >
        {truncate ? truncateHash(hash) : hash}
      </Link>
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
        title="Copy"
      >
        {copied ? <span className="spring-in inline-flex"><Check className="h-3 w-3 text-[#22C55E]" /></span> : <Copy className="h-3 w-3" />}
      </button>
    </span>
  );
}
