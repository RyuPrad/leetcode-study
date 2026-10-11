function solveNQueens(n: number): string[][] {
  const res: string[][] = [];
  const board: string[][] = Array.from({ length: n }, () => Array<string>(n).fill('.'));
  const cols = new Set<number>(); const diag = new Set<number>(); const antiDiag = new Set<number>();
  function dfs(r: number): void {
    if (r === n) { res.push(board.map(row => row.join(''))); return; }
    for (let c = 0; c < n; c++) {
      if (cols.has(c) || diag.has(r - c) || antiDiag.has(r + c)) continue;
      cols.add(c); diag.add(r - c); antiDiag.add(r + c);
      board[r][c] = 'Q';
      dfs(r + 1);
      cols.delete(c); diag.delete(r - c); antiDiag.delete(r + c);
      board[r][c] = '.';
    }
  }
  dfs(0);
  return res;
}
