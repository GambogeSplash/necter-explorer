// Token symbol → logo path mapping
// Uses brand logo for NECTA tokens, existing logos for known tokens, generated SVG for others

const tokenLogos: Record<string, string> = {
  NECTA: "/brand/logo.svg",
  stNECTA: "/brand/logo.svg",
  vNECTA: "/brand/logo.svg",
  "lpNECTA-ETH": "/brand/logo.svg",
  wETH: "/logos/ethereum.svg",
  USDC: "/logos/usdc.svg",
  DAI: "/logos/dai.svg",
  HIVE: "/logos/hive-innovation-lab.svg",
};

// Generate a deterministic colored circle SVG for unknown tokens
function generateTokenSvg(symbol: string): string {
  const colors = ["#FFC933", "#22C55E", "#6E9FFF", "#EB5757", "#6E9FFF", "#EB5757"];
  const seed = symbol.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const color = colors[seed % colors.length];
  const letter = symbol.charAt(0).toUpperCase();
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="${color}"/><text x="16" y="21" text-anchor="middle" fill="#0B0B0D" font-family="sans-serif" font-weight="600" font-size="14">${letter}</text></svg>`
  )}`;
}

export function getTokenLogo(symbol: string): string {
  return tokenLogos[symbol] ?? generateTokenSvg(symbol);
}
