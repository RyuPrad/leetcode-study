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
function minCostConnectPoints(points: number[][]): number {
  const n = points.length;
  const inMST: boolean[] = new Array(n).fill(false);
  const heap = new MinHeap();
  heap.push([0, 0]);
  let total = 0, count = 0;
  while (heap.size() > 0 && count < n) {
    const [cost, i] = heap.pop();
    if (inMST[i]) continue;
    inMST[i] = true;
    total += cost;
    count++;
    for (let j = 0; j < n; j++) {
      if (!inMST[j]) {
        const d = Math.abs(points[i][0] - points[j][0]) + Math.abs(points[i][1] - points[j][1]);
        heap.push([d, j]);
      }
    }
  }
  return total;
}
