function setZeroes(matrix: number[][]): void {
  const m = matrix.length, n = matrix[0].length;
  const rows = new Set<number>();
  const cols = new Set<number>();
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (matrix[i][j] === 0) {
        rows.add(i);
        cols.add(j);
      }
    }
  }
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (rows.has(i) || cols.has(j)) matrix[i][j] = 0;
    }
  }
}
