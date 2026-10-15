int closedIsland(int** grid, int gridSize, int* gridColSize) {
    int m = gridSize, n = gridColSize[0];
    int dirs[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    int* stack = malloc(2 * m * n * sizeof(int));
    int res = 0;
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            if (grid[r][c] != 0) {
                continue;
            }
            bool closed = true;
            int top = 0;
            stack[top++] = r;
            stack[top++] = c;
            grid[r][c] = 1;
            while (top > 0) {
                int x = stack[--top], y = stack[--top];
                if (y == 0 || y == m - 1 || x == 0 || x == n - 1) {
                    closed = false;
                }
                for (int d = 0; d < 4; d++) {
                    int ny = y + dirs[d][0], nx = x + dirs[d][1];
                    if (ny >= 0 && ny < m && nx >= 0 && nx < n && grid[ny][nx] == 0) {
                        grid[ny][nx] = 1;
                        stack[top++] = ny;
                        stack[top++] = nx;
                    }
                }
            }
            if (closed) {
                res++;
            }
        }
    }
    free(stack);
    return res;
}
