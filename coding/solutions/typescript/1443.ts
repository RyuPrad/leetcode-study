function minTime(n: number, edges: number[][], hasApple: boolean[]): number {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }
  const parent = new Array<number>(n).fill(-1);
  parent[0] = 0;
  const order = [0];
  for (let i = 0; i < order.length; i++) {
    for (const next of adj[order[i]]) {
      if (parent[next] === -1) {
        parent[next] = order[i];
        order.push(next);
      }
    }
  }
  const need = hasApple.slice();
  let res = 0;
  for (let i = n - 1; i > 0; i--) {
    const node = order[i];
    if (need[node]) {
      res += 2;
      need[parent[node]] = true;
    }
  }
  return res;
}
