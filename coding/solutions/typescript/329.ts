function longestIncreasingPath(matrix: number[][]): number {
  const rows = matrix.length, cols = matrix[0].length;
  const memo: number[][] = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  let ans = 0;
  function dfs(r: number, c: number): number {
    if (memo[r][c] !== 0) return memo[r][c];
    let best = 1;
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && matrix[nr][nc] > matrix[r][c]) {
        best = Math.max(best, 1 + dfs(nr, nc));
      }
    }
    memo[r][c] = best;
    return best;
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ans = Math.max(ans, dfs(r, c));
    }
  }
  return ans;
}
