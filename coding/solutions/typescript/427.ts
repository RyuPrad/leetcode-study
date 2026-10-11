function construct(grid: number[][]): _Node | null {
  function build(r: number, c: number, n: number): _Node {
    let same = true;
    for (let i = r; i < r + n; i++) {
      for (let j = c; j < c + n; j++) {
        if (grid[i][j] !== grid[r][c]) same = false;
      }
    }
    if (same) return new _Node(grid[r][c] === 1, true);
    const half = n / 2;
    return new _Node(true, false,
      build(r, c, half),
      build(r, c + half, half),
      build(r + half, c, half),
      build(r + half, c + half, half));
  }
  return build(0, 0, grid.length);
}
