function transpose(matrix: number[][]): number[][] {
  const m = matrix.length, n = matrix[0].length;
  const res: number[][] = Array.from({ length: n }, () => new Array<number>(m).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      res[j][i] = matrix[i][j];
    }
  }
  return res;
}
