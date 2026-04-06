"use client";

export function QRCode({ value, size = 120 }: { value: string; size?: number }) {
  const cells = 11;
  const cellSize = size / cells;

  const grid: boolean[][] = [];
  let seed = 0;
  for (let i = 0; i < value.length; i++) seed = (seed * 31 + value.charCodeAt(i)) | 0;

  for (let y = 0; y < cells; y++) {
    grid[y] = [];
    for (let x = 0; x < cells; x++) {
      // Finder patterns in corners
      const inTopLeft = x < 3 && y < 3;
      const inTopRight = x >= cells - 3 && y < 3;
      const inBottomLeft = x < 3 && y >= cells - 3;
      const inFinder = inTopLeft || inTopRight || inBottomLeft;

      const finderBorder =
        inFinder &&
        (x === 0 ||
          x === 2 ||
          x === cells - 1 ||
          x === cells - 3 ||
          y === 0 ||
          y === 2 ||
          y === cells - 1 ||
          y === cells - 3);
      const finderCenter =
        (x === 1 && y === 1) ||
        (x === cells - 2 && y === 1) ||
        (x === 1 && y === cells - 2);

      if (finderBorder || finderCenter) {
        grid[y][x] = true;
      } else if (inFinder) {
        grid[y][x] = false;
      } else {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        grid[y][x] = seed % 3 !== 0;
      }
    }
  }

  return (
    <div className="rounded-lg bg-white p-2 inline-block">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {grid.map((row, y) =>
          row.map((cell, x) =>
            cell ? (
              <rect
                key={`${x}-${y}`}
                x={x * cellSize}
                y={y * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#000"
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
}
