class DSU {
  parent: number[];
  count: number;

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.count = n;
  }

  find(x: number): number {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]];
      x = this.parent[x];
    }
    return x;
  }

  union(a: number, b: number): void {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) {
      this.parent[ra] = rb;
      this.count--;
    }
  }
}

function countComponents(n: number, edges: number[][]): number {
  const dsu = new DSU(n);
  for (const [a, b] of edges) dsu.union(a, b);
  return dsu.count;
}
