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
function networkDelayTime(times: number[][], n: number, k: number): number {
  const adj: number[][][] = Array.from({ length: n + 1 }, () => []);
  for (const [u, v, w] of times) adj[u].push([v, w]);
  const dist: number[] = new Array(n + 1).fill(Infinity);
  dist[k] = 0;
  const heap = new MinHeap();
  heap.push([0, k]);
  while (heap.size() > 0) {
    const [d, node] = heap.pop();
    if (d > dist[node]) continue;
    for (const [nei, w] of adj[node]) {
      if (d + w < dist[nei]) {
        dist[nei] = d + w;
        heap.push([dist[nei], nei]);
      }
    }
  }
  let ans = 0;
  for (let i = 1; i <= n; i++) {
    if (dist[i] === Infinity) return -1;
    ans = Math.max(ans, dist[i]);
  }
  return ans;
}
