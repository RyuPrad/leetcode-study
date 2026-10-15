int countSubIslands(int** grid1, int grid1Size, int* grid1ColSize, int** grid2, int grid2Size, int* grid2ColSize) {
    int m = grid2Size, n = grid2ColSize[0];
    int dirs[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    int* stack = malloc(2 * m * n * sizeof(int));
    int res = 0;
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            if (grid2[r][c] != 1) {
                continue;
            }
            bool sub = true;
            int top = 0;
            stack[top++] = r;
            stack[top++] = c;
            grid2[r][c] = 0;
            while (top > 0) {
                int x = stack[--top], y = stack[--top];
                if (grid1[y][x] == 0) {
                    sub = false;
                }
                for (int d = 0; d < 4; d++) {
                    int ny = y + dirs[d][0], nx = x + dirs[d][1];
                    if (ny >= 0 && ny < m && nx >= 0 && nx < n && grid2[ny][nx] == 1) {
                        grid2[ny][nx] = 0;
                        stack[top++] = ny;
                        stack[top++] = nx;
                    }
                }
            }
            if (sub) {
                res++;
            }
        }
    }
    free(stack);
    return res;
}
