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
function minimumEffortPath(heights: number[][]): number {
  const rows = heights.length, cols = heights[0].length;
  const effort: number[][] = Array.from({ length: rows }, () => new Array<number>(cols).fill(Infinity));
  effort[0][0] = 0;
  const heap = new MinHeap();
  heap.push([0, 0, 0]);
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (heap.size() > 0) {
    const [e, r, c] = heap.pop();
    if (r === rows - 1 && c === cols - 1) return e;
    if (e > effort[r][c]) continue;
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        const ne = Math.max(e, Math.abs(heights[nr][nc] - heights[r][c]));
        if (ne < effort[nr][nc]) { effort[nr][nc] = ne; heap.push([ne, nr, nc]); }
      }
    }
  }
  return 0;
}
