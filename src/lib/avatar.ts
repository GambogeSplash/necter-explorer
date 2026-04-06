// Generate a deterministic avatar SVG from an address hash
// Creates a unique colored geometric pattern for each address

const COLORS = [
  "#FFC933", "#22C55E", "#6E9FFF", "#F2994A", "#9985FF",
  "#EB5757", "#FF6B8A", "#36CFC9", "#B37FEB", "#73D13D",
];

function hashToSeed(hash: string): number {
  let h = 0;
  for (let i = 0; i < hash.length; i++) {
    h = ((h << 5) - h + hash.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function getAddressAvatar(address: string, size = 32): string {
  const seed = hashToSeed(address);
  const bg = COLORS[seed % COLORS.length];
  const fg = COLORS[(seed + 3) % COLORS.length];

  // Generate a simple 3x3 symmetric pixel pattern
  const bits = [];
  for (let i = 0; i < 6; i++) {
    bits.push((seed >> (i * 4)) & 1);
  }

  // Mirror horizontally for symmetry
  const grid = [
    [bits[0], bits[1], bits[2], bits[1], bits[0]],
    [bits[3], bits[4], bits[5], bits[4], bits[3]],
    [bits[0], bits[5], bits[3], bits[5], bits[0]],
    [bits[2], bits[4], bits[1], bits[4], bits[2]],
    [bits[3], bits[0], bits[5], bits[0], bits[3]],
  ];

  const cellSize = size / 5;
  let rects = "";
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      if (grid[y][x]) {
        rects += `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="${fg}"/>`;
      }
    }
  }

  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="${bg}" rx="4"/>${rects}</svg>`
  )}`;
}
