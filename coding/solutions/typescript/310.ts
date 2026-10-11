function findMinHeightTrees(n: number, edges: number[][]): number[] {
  if (n === 1) return [0];
  const adj: number[][] = Array.from({ length: n }, () => []);
  const degree: number[] = new Array(n).fill(0);
  for (const [a, b] of edges) {
    adj[a].push(b); adj[b].push(a);
    degree[a]++; degree[b]++;
  }
  let leaves: number[] = [];
  for (let i = 0; i < n; i++) {
    if (degree[i] === 1) leaves.push(i);
  }
  let remaining = n;
  while (remaining > 2) {
    remaining -= leaves.length;
    const next: number[] = [];
    for (const leaf of leaves) {
      for (const nei of adj[leaf]) {
        degree[nei]--;
        if (degree[nei] === 1) next.push(nei);
      }
    }
    leaves = next;
  }
  return leaves;
}
