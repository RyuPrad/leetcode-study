function numberOfGoodPaths(vals: number[], edges: number[][]): number {
  const n = vals.length;
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }
  const order = [...vals.keys()].sort((a, b) => vals[a] - vals[b]);
  let res = 0, i = 0;
  while (i < n) {
    let j = i;
    while (j < n && vals[order[j]] === vals[order[i]]) {
      for (const next of adj[order[j]]) {
        if (vals[next] <= vals[order[j]]) {
          parent[find(next)] = find(order[j]);
        }
      }
      j++;
    }
    const count = new Map<number, number>();
    for (let k = i; k < j; k++) {
      const root = find(order[k]);
      count.set(root, (count.get(root) || 0) + 1);
    }
    for (const c of count.values()) {
      res += c * (c + 1) / 2;
    }
    i = j;
  }
  return res;
}
