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
    const ra = this.find(a), rb = this.find(b);
    if (ra !== rb) {
      this.parent[ra] = rb;
      this.count--;
    }
  }
}

function canTraverseAllPairs(nums: number[]): boolean {
  const n = nums.length;
  if (n === 1) return true;
  const dsu = new DSU(n);
  const primeToIndex = new Map<number, number>();
  for (let i = 0; i < n; i++) {
    let x = nums[i];
    if (x === 1) return false;
    for (let p = 2; p * p <= x; p++) {
      if (x % p === 0) {
        if (primeToIndex.has(p)) dsu.union(i, primeToIndex.get(p)!);
        else primeToIndex.set(p, i);
        while (x % p === 0) x = Math.floor(x / p);
      }
    }
    if (x > 1) {
      if (primeToIndex.has(x)) dsu.union(i, primeToIndex.get(x)!);
      else primeToIndex.set(x, i);
    }
  }
  return dsu.count === 1;
}
