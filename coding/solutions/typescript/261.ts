class DSU {
  parent: number[];

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
  }

  find(x: number): number {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]];
      x = this.parent[x];
    }
    return x;
  }

  union(a: number, b: number): boolean {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra === rb) return false;
    this.parent[ra] = rb;
    return true;
  }
}

function validTree(n: number, edges: number[][]): boolean {
  if (edges.length !== n - 1) return false;
  const dsu = new DSU(n);
  for (const [a, b] of edges) {
    if (!dsu.union(a, b)) return false;
  }
  return true;
}
