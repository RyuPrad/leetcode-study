function totalNQueens(n: number): number {
  let count = 0;
  const cols = new Set<number>(); const diag = new Set<number>(); const antiDiag = new Set<number>();
  function dfs(r: number): void {
    if (r === n) { count++; return; }
    for (let c = 0; c < n; c++) {
      if (cols.has(c) || diag.has(r - c) || antiDiag.has(r + c)) continue;
      cols.add(c); diag.add(r - c); antiDiag.add(r + c);
      dfs(r + 1);
      cols.delete(c); diag.delete(r - c); antiDiag.delete(r + c);
    }
  }
  dfs(0);
  return count;
}
