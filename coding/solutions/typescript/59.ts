function generateMatrix(n: number): number[][] {
  const matrix = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  let top = 0, bottom = n - 1, left = 0, right = n - 1;
  let value = 1;
  while (value <= n * n) {
    for (let c = left; c <= right; c++) {
      matrix[top][c] = value++;
    }
    top++;
    for (let r = top; r <= bottom; r++) {
      matrix[r][right] = value++;
    }
    right--;
    for (let c = right; c >= left; c--) {
      matrix[bottom][c] = value++;
    }
    bottom--;
    for (let r = bottom; r >= top; r--) {
      matrix[r][left] = value++;
    }
    left++;
  }
  return matrix;
}
