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

  union(a: number, b: number): boolean {
    const ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false;
    this.parent[ra] = rb;
    this.count--;
    return true;
  }
}

function findCriticalAndPseudoCriticalEdges(n: number, edges: number[][]): number[][] {
  const indexed = edges.map((e, i) => [e[0], e[1], e[2], i]);
  indexed.sort((a, b) => a[2] - b[2]);
  const buildMST = (skip: number, force: number): number => {
    const dsu = new DSU(n);
    let weight = 0;
    if (force !== -1) { dsu.union(indexed[force][0], indexed[force][1]); weight += indexed[force][2]; }
    for (let i = 0; i < indexed.length; i++) {
      if (i === skip) continue;
      if (dsu.union(indexed[i][0], indexed[i][1])) weight += indexed[i][2];
    }
    return dsu.count === 1 ? weight : Infinity;
  };
  const mstWeight = buildMST(-1, -1);
  const critical: number[] = [], pseudo: number[] = [];
  for (let i = 0; i < indexed.length; i++) {
    if (buildMST(i, -1) > mstWeight) critical.push(indexed[i][3]);
    else if (buildMST(-1, i) === mstWeight) pseudo.push(indexed[i][3]);
  }
  return [critical, pseudo];
}
