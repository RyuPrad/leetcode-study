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

  union(a: number, b: number): void {
    this.parent[this.find(a)] = this.find(b);
  }
}

function accountsMerge(accounts: string[][]): string[][] {
  const dsu = new DSU(accounts.length);
  const emailToId = new Map<string, number>();
  for (let i = 0; i < accounts.length; i++) {
    for (let j = 1; j < accounts[i].length; j++) {
      const email = accounts[i][j];
      if (emailToId.has(email)) dsu.union(i, emailToId.get(email)!);
      else emailToId.set(email, i);
    }
  }
  const groups = new Map<number, string[]>();
  for (const [email, id] of emailToId) {
    const root = dsu.find(id);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root)!.push(email);
  }
  const res: string[][] = [];
  for (const [root, emails] of groups) {
    emails.sort();
    res.push([accounts[root][0], ...emails]);
  }
  return res;
}
