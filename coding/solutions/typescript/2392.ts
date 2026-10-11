function buildMatrix(k: number, rowConditions: number[][], colConditions: number[][]): number[][] {
  const topo = (conditions: number[][]): number[] | null => {
    const adj: number[][] = Array.from({ length: k + 1 }, () => []);
    const indeg: number[] = new Array(k + 1).fill(0);
    for (const [a, b] of conditions) { adj[a].push(b); indeg[b]++; }
    const queue: number[] = [];
    for (let i = 1; i <= k; i++) if (indeg[i] === 0) queue.push(i);
    const order: number[] = [];
    let head = 0;
    while (head < queue.length) {
      const node = queue[head++];
      order.push(node);
      for (const nei of adj[node]) { if (--indeg[nei] === 0) queue.push(nei); }
    }
    return order.length === k ? order : null;
  };
  const rowOrder = topo(rowConditions);
  const colOrder = topo(colConditions);
  if (rowOrder === null || colOrder === null) return [];
  const rowPos = new Map<number, number>(), colPos = new Map<number, number>();
  rowOrder.forEach((v, i) => rowPos.set(v, i));
  colOrder.forEach((v, i) => colPos.set(v, i));
  const matrix: number[][] = Array.from({ length: k }, () => new Array<number>(k).fill(0));
  for (let v = 1; v <= k; v++) matrix[rowPos.get(v)!][colPos.get(v)!] = v;
  return matrix;
}
