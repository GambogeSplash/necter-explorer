"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { Copy, Check, Wallet, FileCode, Shield, Users } from "lucide-react";
import { HashLink } from "@/components/hash-link";
import { TimeAgo } from "@/components/time-ago";
import { StatusBadge } from "@/components/status-badge";
import { Pagination } from "@/components/pagination";
import { getAddressDetails, transactionsExtended, networkStats } from "@/lib/mock-data";
import { getTokenLogo } from "@/lib/token-logos";
import { getAddressAvatar } from "@/lib/avatar";
import { ShareButton } from "@/components/share-button";
import { QRCode } from "@/components/qr-code";
import { MobileCard } from "@/components/mobile-card";

type Tab = "overview" | "transactions" | "tokens" | "contract";

export default function AddressPage({
  params,
}: {
  params: Promise<{ hash: string }>;
}) {
  const { hash } = use(params);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [copied, setCopied] = useState(false);
  const [txPage, setTxPage] = useState(1);
  const [txPageSize, setTxPageSize] = useState(25);

  const details = getAddressDetails(hash);

  const addressTxs = useMemo(
    () =>
      transactionsExtended.filter(
        (tx) =>
          tx.from.toLowerCase() === hash.toLowerCase() ||
          tx.to.toLowerCase() === hash.toLowerCase()
      ),
    [hash]
  );

  const txTotalPages = Math.ceil(addressTxs.length / txPageSize);
  const paginatedTxs = addressTxs.slice(
    (txPage - 1) * txPageSize,
    txPage * txPageSize
  );

  async function handleCopy() {
    await navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const tabs: { key: Tab; label: string; show: boolean }[] = [
    { key: "overview", label: "Overview", show: true },
    { key: "transactions", label: "Transactions", show: true },
    { key: "tokens", label: "Token Holdings", show: true },
    { key: "contract", label: "Contract", show: details.isContract },
  ];

  const badges: { label: string; icon: React.ReactNode; show: boolean }[] = [
    {
      label: `${details.txCount} txs`,
      icon: <Wallet className="h-3 w-3" />,
      show: true,
    },
    {
      label: `${details.tokenHoldings.length} tokens`,
      icon: <Users className="h-3 w-3" />,
      show: true,
    },
    {
      label: "Contract",
      icon: <FileCode className="h-3 w-3" />,
      show: details.isContract,
    },
    {
      label: "Staker",
      icon: <Shield className="h-3 w-3" />,
      show: details.isStaker,
    },
    {
      label: "Operator",
      icon: <Shield className="h-3 w-3" />,
      show: details.isOperator,
    },
  ];

  return (
    <div className="px-2.5 py-2 space-y-4">

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <img src={getAddressAvatar(hash)} alt="" className="h-8 w-8 rounded-md" />
          <h1 className="text-xl font-semibold tracking-tight">Address</h1>
          <span className="font-mono-data text-sm text-muted-foreground break-all">
            {hash}
          </span>
          <button
            onClick={handleCopy}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Copy address"
          >
            {copied ? (
              <Check className="h-4 w-4 text-[#22C55E]" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
          <ShareButton />
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-2xl font-semibold font-mono-data">
            {parseFloat(details.balance).toLocaleString()} NECTA
          </span>
          <span className="text-sm text-muted-foreground">
            (${parseFloat(details.usdValue).toLocaleString()})
          </span>
          <div className="hidden lg:block">
            <QRCode value={hash} size={80} />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {badges
            .filter((b) => b.show)
            .map((badge) => (
              <span
                key={badge.label}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-secondary text-muted-foreground"
              >
                {badge.icon}
                {badge.label}
              </span>
            ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="n-tabbar">
        {tabs
          .filter((t) => t.show)
          .map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`n-tabbar-btn ${activeTab === tab.key ? "n-tabbar-btn--active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* Balance Card */}
          <div className="rounded-lg bg-card border border-border p-5 space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              Balance
            </h2>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-semibold font-mono-data">
                {parseFloat(details.balance).toLocaleString()} NECTA
              </span>
              <span className="text-sm text-muted-foreground">
                @ ${networkStats.nectaPrice} = $
                {parseFloat(details.usdValue).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="rounded-lg bg-card border border-border overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-medium">Recent Transactions</h2>
              {addressTxs.length > 5 && (
                <button
                  onClick={() => setActiveTab("transactions")}
                  className="text-xs text-primary hover:underline"
                >
                  View all
                </button>
              )}
            </div>
            {addressTxs.length === 0 ? (
              <p className="text-sm text-muted-foreground px-5 py-8 text-center">
                No transactions found.
              </p>
            ) : (
              addressTxs.slice(0, 5).map((tx) => {
                const isIn =
                  tx.to.toLowerCase() === hash.toLowerCase();
                return (
                  <div
                    key={tx.hash}
                    className="flex items-center justify-between px-5 py-2.5 border-b border-border last:border-0 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <HashLink hash={tx.hash} type="tx" />
                      <span
                        className={`inline-flex px-1.5 py-0.5 rounded-[3px] text-[10px] font-medium ${
                          isIn
                            ? "bg-[#22C55E]/10 text-[#22C55E]"
                            : "bg-[#EB5757]/10 text-[#EB5757]"
                        }`}
                      >
                        {isIn ? "IN" : "OUT"}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono-data">
                        Block #{tx.blockNumber.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono-data text-sm">
                        {tx.value} NECTA
                      </span>
                      <TimeAgo timestamp={tx.timestamp} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Token Holdings Summary */}
          {details.tokenHoldings.length > 0 && (
            <div className="rounded-lg bg-card border border-border overflow-hidden">
              <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-medium">Token Holdings</h2>
                {details.tokenHoldings.length > 3 && (
                  <button
                    onClick={() => setActiveTab("tokens")}
                    className="text-xs text-primary hover:underline"
                  >
                    View all
                  </button>
                )}
              </div>
              {details.tokenHoldings.slice(0, 3).map((token, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-5 py-2.5 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <img src={getTokenLogo(token.tokenSymbol)} alt={token.tokenSymbol} className="h-5 w-5 rounded-full" />
                    <span className="text-sm font-medium">
                      {token.tokenName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {token.tokenSymbol}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono-data text-sm">
                      {parseFloat(token.balance).toLocaleString()}{" "}
                      {token.tokenSymbol}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ${parseFloat(token.value).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === "transactions" && (
        <div className="space-y-4">
          <div>
            {addressTxs.length === 0 ? (
              <div className="rounded-lg bg-card border border-border">
                <p className="text-sm text-muted-foreground px-5 py-8 text-center">
                  No transactions found.
                </p>
              </div>
            ) : (
              <>
                {/* Mobile */}
                <div className="md:hidden space-y-3">
                  {paginatedTxs.map((tx) => {
                    const isIn = tx.to.toLowerCase() === hash.toLowerCase();
                    return (
                      <MobileCard
                        key={tx.hash}
                        rows={[
                          { label: "Hash", value: <HashLink hash={tx.hash} type="tx" /> },
                          { label: "Direction", value: <span className={`inline-flex px-1.5 py-0.5 rounded-[3px] text-[10px] font-medium ${isIn ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-[#EB5757]/10 text-[#EB5757]"}`}>{isIn ? "IN" : "OUT"}</span> },
                          { label: "Value", value: <span className="font-mono-data">{tx.value} NECTA</span> },
                          { label: "Time", value: <TimeAgo timestamp={tx.timestamp} /> },
                        ]}
                      />
                    );
                  })}
                </div>
                {/* Desktop */}
                <div className="hidden md:block rounded-lg bg-card border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="px-5 py-2.5 text-left text-[11px] text-muted-foreground uppercase tracking-wider font-normal">Hash</th>
                          <th className="px-5 py-2.5 text-left text-[11px] text-muted-foreground uppercase tracking-wider font-normal">Block</th>
                          <th className="px-5 py-2.5 text-left text-[11px] text-muted-foreground uppercase tracking-wider font-normal">From</th>
                          <th className="px-5 py-2.5 text-left text-[11px] text-muted-foreground uppercase tracking-wider font-normal">To</th>
                          <th className="px-5 py-2.5 text-center text-[11px] text-muted-foreground uppercase tracking-wider font-normal">Direction</th>
                          <th className="px-5 py-2.5 text-right text-[11px] text-muted-foreground uppercase tracking-wider font-normal">Value</th>
                          <th className="px-5 py-2.5 text-right text-[11px] text-muted-foreground uppercase tracking-wider font-normal">Fee</th>
                          <th className="px-5 py-2.5 text-right text-[11px] text-muted-foreground uppercase tracking-wider font-normal">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedTxs.map((tx) => {
                          const isIn = tx.to.toLowerCase() === hash.toLowerCase();
                          return (
                            <tr key={tx.hash} className="border-b border-border last:border-0 hover:bg-secondary transition-colors">
                              <td className="px-5 py-2.5"><HashLink hash={tx.hash} type="tx" /></td>
                              <td className="px-5 py-2.5"><Link href={`/blocks/${tx.blockNumber}`} className="font-mono-data text-muted-foreground hover:text-primary transition-colors text-xs">#{tx.blockNumber.toLocaleString()}</Link></td>
                              <td className="px-5 py-2.5"><HashLink hash={tx.from} type="address" /></td>
                              <td className="px-5 py-2.5"><HashLink hash={tx.to} type="address" /></td>
                              <td className="px-5 py-2.5 text-center"><span className={`inline-flex px-1.5 py-0.5 rounded-[3px] text-[10px] font-medium ${isIn ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-[#EB5757]/10 text-[#EB5757]"}`}>{isIn ? "IN" : "OUT"}</span></td>
                              <td className="px-5 py-2.5 text-right font-mono-data">{tx.value}</td>
                              <td className="px-5 py-2.5 text-right font-mono-data text-muted-foreground text-xs">{tx.fee}</td>
                              <td className="px-5 py-2.5 text-right"><TimeAgo timestamp={tx.timestamp} /></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>

          {addressTxs.length > 0 && (
            <Pagination
              currentPage={txPage}
              totalPages={txTotalPages}
              onPageChange={setTxPage}
              pageSize={txPageSize}
              totalItems={addressTxs.length}
              onPageSizeChange={(size) => {
                setTxPageSize(size);
                setTxPage(1);
              }}
            />
          )}
        </div>
      )}

      {/* Token Holdings Tab */}
      {activeTab === "tokens" && (
        <div>
          {details.tokenHoldings.length === 0 ? (
            <div className="rounded-lg bg-card border border-border">
              <p className="text-sm text-muted-foreground px-5 py-8 text-center">
                No token holdings found.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile */}
              <div className="md:hidden space-y-3">
                {details.tokenHoldings.map((token, i) => {
                  const change = parseFloat(token.change24h);
                  return (
                    <MobileCard
                      key={i}
                      rows={[
                        { label: "Token", value: <div className="flex items-center gap-2"><img src={getTokenLogo(token.tokenSymbol)} alt={token.tokenSymbol} className="h-4 w-4 rounded-full" /><span className="font-medium">{token.tokenSymbol}</span></div> },
                        { label: "Balance", value: <span className="font-mono-data">{parseFloat(token.balance).toLocaleString()}</span> },
                        { label: "Value", value: <span className="font-mono-data">${parseFloat(token.value).toLocaleString()}</span> },
                        { label: "24h", value: <span className={`font-mono-data ${change >= 0 ? "text-[#22C55E]" : "text-[#EB5757]"}`}>{change >= 0 ? "+" : ""}{token.change24h}%</span> },
                      ]}
                    />
                  );
                })}
              </div>
              {/* Desktop */}
              <div className="hidden md:block rounded-lg bg-card border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-5 py-2.5 text-left text-[11px] text-muted-foreground uppercase tracking-wider font-normal">Token</th>
                        <th className="px-5 py-2.5 text-left text-[11px] text-muted-foreground uppercase tracking-wider font-normal">Symbol</th>
                        <th className="px-5 py-2.5 text-right text-[11px] text-muted-foreground uppercase tracking-wider font-normal">Balance</th>
                        <th className="px-5 py-2.5 text-right text-[11px] text-muted-foreground uppercase tracking-wider font-normal">Value (USD)</th>
                        <th className="px-5 py-2.5 text-right text-[11px] text-muted-foreground uppercase tracking-wider font-normal">Price</th>
                        <th className="px-5 py-2.5 text-right text-[11px] text-muted-foreground uppercase tracking-wider font-normal">24h Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.tokenHoldings.map((token, i) => {
                        const change = parseFloat(token.change24h);
                        return (
                          <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary transition-colors">
                            <td className="px-5 py-2.5 font-medium"><div className="flex items-center gap-2"><img src={getTokenLogo(token.tokenSymbol)} alt={token.tokenSymbol} className="h-5 w-5 rounded-full" />{token.tokenName}</div></td>
                            <td className="px-5 py-2.5 text-muted-foreground">{token.tokenSymbol}</td>
                            <td className="px-5 py-2.5 text-right font-mono-data">{parseFloat(token.balance).toLocaleString()}</td>
                            <td className="px-5 py-2.5 text-right font-mono-data">${parseFloat(token.value).toLocaleString()}</td>
                            <td className="px-5 py-2.5 text-right font-mono-data text-muted-foreground">${token.price}</td>
                            <td className="px-5 py-2.5 text-right"><span className={`font-mono-data text-sm ${change >= 0 ? "text-[#22C55E]" : "text-[#EB5757]"}`}>{change >= 0 ? "+" : ""}{token.change24h}%</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Contract Tab */}
      {activeTab === "contract" && details.isContract && (
        <div className="space-y-4">
          {/* Contract Info */}
          <div className="rounded-lg bg-card border border-border overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <h2 className="text-sm font-medium">Contract Info</h2>
            </div>
            {[
              { label: "Contract Name", value: "NectarRegistry" },
              { label: "Compiler", value: "Solidity v0.8.24+commit.e11b9ed9" },
              {
                label: "Verification",
                value: (
                  <span className="inline-flex px-1.5 py-0.5 rounded-[3px] text-[11px] font-medium bg-[#22C55E]/10 text-[#22C55E]">
                    Verified
                  </span>
                ),
              },
              { label: "License", value: "MIT" },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center py-3 px-5 border-b border-border last:border-0"
              >
                <span className="text-sm text-muted-foreground w-44 shrink-0">
                  {row.label}
                </span>
                <span className="text-sm font-mono-data">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Read Functions */}
          <div className="rounded-lg bg-card border border-border overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <h2 className="text-sm font-medium">Read Functions</h2>
            </div>
            {[
              {
                name: "getOwner",
                returns: "address",
                description: "Returns the contract owner address",
              },
              {
                name: "totalSupply",
                returns: "uint256",
                description: "Returns total token supply",
              },
              {
                name: "balanceOf",
                returns: "uint256",
                description: "Returns balance of given address",
              },
            ].map((fn) => (
              <div
                key={fn.name}
                className="flex items-center justify-between px-5 py-3 border-b border-border last:border-0"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-data text-sm font-medium">
                      {fn.name}()
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      returns ({fn.returns})
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {fn.description}
                  </p>
                </div>
                <button className="n-btn n-btn--primary n-btn--sm">
                  Query
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
