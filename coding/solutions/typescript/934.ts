function shortestBridge(grid: number[][]): number {
  const n = grid.length;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let start: number[] | null = null;
  for (let r = 0; r < n && !start; r++) {
    for (let c = 0; c < n && !start; c++) {
      if (grid[r][c] === 1) {
        start = [r, c];
      }
    }
  }
  let queue: number[][] = [];
  const stack: number[][] = [start!];
  grid[start![0]][start![1]] = 2;
  while (stack.length) {
    const [y, x] = stack.pop()!;
    queue.push([y, x]);
    for (const [dy, dx] of dirs) {
      const ny = y + dy, nx = x + dx;
      if (ny >= 0 && ny < n && nx >= 0 && nx < n && grid[ny][nx] === 1) {
        grid[ny][nx] = 2;
        stack.push([ny, nx]);
      }
    }
  }
  let distance = 0;
  while (queue.length) {
    const next: number[][] = [];
    for (const [y, x] of queue) {
      for (const [dy, dx] of dirs) {
        const ny = y + dy, nx = x + dx;
        if (ny < 0 || ny >= n || nx < 0 || nx >= n || grid[ny][nx] === 2) {
          continue;
        }
        if (grid[ny][nx] === 1) {
          return distance;
        }
        grid[ny][nx] = 2;
        next.push([ny, nx]);
      }
    }
    queue = next;
    distance++;
  }
  return -1;
}
