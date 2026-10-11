static int dfs(int** grid, int rows, int cols, int r, int c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] != 1) return 0;
    grid[r][c] = 0;
    return 1 + dfs(grid, rows, cols, r + 1, c) + dfs(grid, rows, cols, r - 1, c)
             + dfs(grid, rows, cols, r, c + 1) + dfs(grid, rows, cols, r, c - 1);
}

int maxAreaOfIsland(int** grid, int gridSize, int* gridColSize) {
    int ans = 0;
    for (int r = 0; r < gridSize; r++) {
        for (int c = 0; c < gridColSize[0]; c++) {
            if (grid[r][c] == 1) {
                int area = dfs(grid, gridSize, gridColSize[0], r, c);
                if (area > ans) ans = area;
            }
        }
    }
    return ans;
}
