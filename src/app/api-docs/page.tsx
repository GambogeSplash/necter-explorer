"use client";

import { Code2, KeyRound } from "lucide-react";
import { PageTitle } from "@/components/page-title";

interface Endpoint {
  method: string;
  path: string;
  description: string;
  example: string;
}

const endpointGroups: { category: string; endpoints: Endpoint[] }[] = [
  {
    category: "Blocks",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/blocks",
        description: "List recent blocks with pagination support.",
        example: `{
  "blocks": [
    { "height": 2400312, "hash": "0xa3f7e2...", "txCount": 84 }
  ],
  "total": 2400312
}`,
      },
      {
        method: "GET",
        path: "/api/v1/blocks/:height",
        description: "Get a specific block by its height.",
        example: `{
  "height": 2400312,
  "hash": "0xa3f7e2b8c1d4...",
  "timestamp": "2026-04-05T10:00:00Z",
  "txCount": 84
}`,
      },
    ],
  },
  {
    category: "Transactions",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/transactions",
        description: "List recent transactions with optional status and type filters.",
        example: `{
  "transactions": [
    { "hash": "0x8a3fe2b1...", "type": "transfer", "value": "150.00" }
  ],
  "total": 24871455
}`,
      },
      {
        method: "GET",
        path: "/api/v1/transactions/:hash",
        description: "Get a specific transaction by its hash.",
        example: `{
  "hash": "0x8a3fe2b1c3d4...",
  "from": "0x1a2b...",
  "to": "0x9f8e...",
  "value": "150.00",
  "status": "confirmed"
}`,
      },
    ],
  },
  {
    category: "Addresses",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/addresses/:address",
        description: "Get address details including balance and token holdings.",
        example: `{
  "address": "0x1a2bD4e5...",
  "balance": "12450.00",
  "txCount": 347,
  "tokenCount": 5
}`,
      },
      {
        method: "GET",
        path: "/api/v1/addresses/:address/transactions",
        description: "List transactions for a specific address.",
        example: `{
  "transactions": [
    { "hash": "0x8a3f...", "direction": "in", "value": "50.00" }
  ],
  "total": 347
}`,
      },
    ],
  },
  {
    category: "Tokens",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/tokens",
        description: "List all tokens on the Necter Network.",
        example: `{
  "tokens": [
    { "symbol": "NECTA", "name": "Necter", "price": "0.47" }
  ],
  "total": 5
}`,
      },
      {
        method: "GET",
        path: "/api/v1/tokens/:symbol",
        description: "Get detailed information for a specific token.",
        example: `{
  "symbol": "NECTA",
  "name": "Necter",
  "price": "0.47",
  "holders": 48721,
  "totalSupply": "100000000"
}`,
      },
    ],
  },
  {
    category: "DePIN",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/devices",
        description: "List registered DePIN devices with status and uptime.",
        example: `{
  "devices": [
    { "deviceId": "DEV-1000", "status": "active", "uptime": 99.2 }
  ],
  "total": 34521
}`,
      },
      {
        method: "GET",
        path: "/api/v1/operators",
        description: "List network operators with stake and reputation data.",
        example: `{
  "operators": [
    { "operatorId": "OP-100", "stake": "245000", "reputation": 95 }
  ],
  "total": 12847
}`,
      },
    ],
  },
];

export default function ApiDocsPage() {
  return (
    <div className="px-2.5 py-2 space-y-4">
      <PageTitle title="API Documentation" />

      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="rounded-lg bg-secondary p-2">
          <Code2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">API Documentation</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Integrate Necter Explorer data into your applications
          </p>
        </div>
      </div>

      {/* Authentication */}
      <div className="rounded-lg border border-border bg-card">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Authentication</h2>
        </div>
        <div className="p-5">
          <p className="text-sm text-muted-foreground">
            API keys are available for registered developers. Rate limit: 100 requests/minute.
          </p>
          <div className="mt-3 bg-secondary rounded-md p-3 font-mono-data text-xs overflow-x-auto">
            <span className="text-muted-foreground">Authorization:</span> Bearer YOUR_API_KEY
          </div>
        </div>
      </div>

      {/* Endpoint Groups */}
      {endpointGroups.map((group) => (
        <div key={group.category}>
          <h2 className="text-base font-semibold mb-3">{group.category}</h2>
          <div className="space-y-3">
            {group.endpoints.map((endpoint) => (
              <div
                key={endpoint.path}
                className="rounded-lg border border-border bg-card"
              >
                <div className="px-5 py-3 border-b border-border flex items-center gap-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#22C55E]/10 text-[#22C55E]">
                    {endpoint.method}
                  </span>
                  <code className="font-mono-data text-sm">{endpoint.path}</code>
                </div>
                <div className="p-5 space-y-3">
                  <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Example response:</p>
                    <pre className="bg-secondary rounded-md p-3 font-mono-data text-xs overflow-x-auto whitespace-pre">
                      {endpoint.example}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
