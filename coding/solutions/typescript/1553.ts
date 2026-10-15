function minDays(n: number): number {
  const memo = new Map<number, number>([[0, 0], [1, 1]]);
  const dfs = (k: number): number => {
    if (memo.has(k)) {
      return memo.get(k)!;
    }
    const half = k % 2 + dfs(Math.floor(k / 2));
    const third = k % 3 + dfs(Math.floor(k / 3));
    const res = 1 + Math.min(half, third);
    memo.set(k, res);
    return res;
  };
  return dfs(n);
}
