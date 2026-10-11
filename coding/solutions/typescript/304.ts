class NumMatrix {
  private prefix: number[][];

  constructor(matrix: number[][]) {
    const m = matrix.length;
    const n = matrix[0].length;
    this.prefix = Array.from({ length: m + 1 }, () =>
      new Array<number>(n + 1).fill(0));
    for (let r = 0; r < m; r++) {
      for (let c = 0; c < n; c++) {
        this.prefix[r + 1][c + 1] =
          this.prefix[r][c + 1] + this.prefix[r + 1][c]
          - this.prefix[r][c] + matrix[r][c];
      }
    }
  }

  sumRegion(row1: number, col1: number, row2: number, col2: number): number {
    return this.prefix[row2 + 1][col2 + 1]
         - this.prefix[row1][col2 + 1]
         - this.prefix[row2 + 1][col1]
         + this.prefix[row1][col1];
  }
}
