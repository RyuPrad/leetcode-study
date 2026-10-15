int numEnclaves(int** grid, int gridSize, int* gridColSize) {
    int m = gridSize, n = gridColSize[0];
    int dirs[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    int* stack = malloc(2 * m * n * sizeof(int));
    int top = 0;
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            if (grid[r][c] == 1 && (r == 0 || r == m - 1 || c == 0 || c == n - 1)) {
                grid[r][c] = 0;
                stack[top++] = r;
                stack[top++] = c;
            }
        }
    }
    while (top > 0) {
        int x = stack[--top], y = stack[--top];
        for (int d = 0; d < 4; d++) {
            int ny = y + dirs[d][0], nx = x + dirs[d][1];
            if (ny >= 0 && ny < m && nx >= 0 && nx < n && grid[ny][nx] == 1) {
                grid[ny][nx] = 0;
                stack[top++] = ny;
                stack[top++] = nx;
            }
        }
    }
    int res = 0;
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            res += grid[r][c];
        }
    }
    free(stack);
    return res;
}
