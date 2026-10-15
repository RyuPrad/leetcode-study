function largestPathValue(colors: string, edges: number[][]): number {
  const n = colors.length;
  const adj: number[][] = Array.from({ length: n }, () => []);
  const indegree: number[] = new Array(n).fill(0);
  for (const [a, b] of edges) {
    adj[a].push(b);
    indegree[b]++;
  }
  const count = Array.from({ length: n }, () => new Array<number>(26).fill(0));
  const queue: number[] = [];
  for (let node = 0; node < n; node++) {
    if (indegree[node] === 0) {
      queue.push(node);
    }
  }
  let res = 0;
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head];
    const own = colors.charCodeAt(node) - 97;
    count[node][own]++;
    res = Math.max(res, count[node][own]);
    for (const next of adj[node]) {
      count[next] = count[next].map((value, k) => Math.max(value, count[node][k]));
      indegree[next]--;
      if (indegree[next] === 0) {
        queue.push(next);
      }
    }
  }
  return queue.length === n ? res : -1;
}
