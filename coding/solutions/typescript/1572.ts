function diagonalSum(mat: number[][]): number {
  const n = mat.length;
  let res = 0;
  for (let i = 0; i < n; i++) {
    res += mat[i][i];
    if (i !== n - 1 - i) {
      res += mat[i][n - 1 - i];
    }
  }
  return res;
}
