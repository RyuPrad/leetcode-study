class MinHeap {
  heap: number[][] = [];
  size(): number { return this.heap.length; }
  push(item: number[]): void {
    const h = this.heap;
    h.push(item);
    let i = h.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (h[p][0] <= h[i][0]) break;
      [h[p], h[i]] = [h[i], h[p]];
      i = p;
    }
  }
  pop(): number[] {
    const h = this.heap;
    const top = h[0];
    const last = h.pop()!;
    if (h.length > 0) {
      h[0] = last;
      let i = 0;
      while (true) {
        let l = 2 * i + 1, r = 2 * i + 2, s = i;
        if (l < h.length && h[l][0] < h[s][0]) s = l;
        if (r < h.length && h[r][0] < h[s][0]) s = r;
        if (s === i) break;
        [h[s], h[i]] = [h[i], h[s]];
        i = s;
      }
    }
    return top;
  }
}
function swimInWater(grid: number[][]): number {
  const n = grid.length;
  const time: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(Infinity));
  time[0][0] = grid[0][0];
  const heap = new MinHeap();
  heap.push([grid[0][0], 0, 0]);
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (heap.size() > 0) {
    const [t, r, c] = heap.pop();
    if (r === n - 1 && c === n - 1) return t;
    if (t > time[r][c]) continue;
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n) {
        const nt = Math.max(t, grid[nr][nc]);
        if (nt < time[nr][nc]) { time[nr][nc] = nt; heap.push([nt, nr, nc]); }
      }
    }
  }
  return -1;
}
