function findSmallestSetOfVertices(n: number, edges: number[][]): number[] {
  const hasIncoming: boolean[] = new Array(n).fill(false);
  for (const [, to] of edges) {
    hasIncoming[to] = true;
  }
  const res: number[] = [];
  for (let node = 0; node < n; node++) {
    if (!hasIncoming[node]) {
      res.push(node);
    }
  }
  return res;
}
