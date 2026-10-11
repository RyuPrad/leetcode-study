function pacificAtlantic(heights: number[][]): number[][] {
  const rows = heights.length;
  const cols = heights[0].length;
  const pac: boolean[][] = Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false));
  const atl: boolean[][] = Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false));
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const dfs = (r: number, c: number, ocean: boolean[][], prev: number): void => {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    if (ocean[r][c] || heights[r][c] < prev) return;
    ocean[r][c] = true;
    for (const [dr, dc] of dirs) dfs(r + dr, c + dc, ocean, heights[r][c]);
  };
  for (let r = 0; r < rows; r++) {
    dfs(r, 0, pac, -Infinity);
    dfs(r, cols - 1, atl, -Infinity);
  }
  for (let c = 0; c < cols; c++) {
    dfs(0, c, pac, -Infinity);
    dfs(rows - 1, c, atl, -Infinity);
  }
  const res: number[][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (pac[r][c] && atl[r][c]) res.push([r, c]);
    }
  }
  return res;
}
