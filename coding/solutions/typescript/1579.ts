function maxNumEdgesToRemove(n: number, edges: number[][]): number {
  const alice = Array.from({ length: n + 1 }, (_, i) => i);
  const bob = Array.from({ length: n + 1 }, (_, i) => i);
  const find = (parent: number[], x: number): number => (parent[x] === x ? x : (parent[x] = find(parent, parent[x])));
  const union = (parent: number[], a: number, b: number): boolean => {
    const ra = find(parent, a), rb = find(parent, b);
    if (ra === rb) {
      return false;
    }
    parent[ra] = rb;
    return true;
  };
  let used = 0, aliceParts = n, bobParts = n;
  edges.sort((x, y) => y[0] - x[0]);
  for (const [type, a, b] of edges) {
    let useful = false;
    if (type !== 2 && union(alice, a, b)) {
      aliceParts--;
      useful = true;
    }
    if (type !== 1 && union(bob, a, b)) {
      bobParts--;
      useful = true;
    }
    if (useful) {
      used++;
    }
  }
  return aliceParts === 1 && bobParts === 1 ? edges.length - used : -1;
}
