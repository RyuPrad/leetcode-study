int orangesRotting(int** grid, int gridSize, int* gridColSize) {
    int rows = gridSize;
    int cols = gridColSize[0];
    int* queue = malloc(rows * cols * 2 * sizeof(int));
    int head = 0, tail = 0, fresh = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == 2) { queue[tail++] = r; queue[tail++] = c; }
            else if (grid[r][c] == 1) fresh++;
        }
    }
    int minutes = 0;
    const int dirs[4][2] = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
    while (head < tail && fresh > 0) {
        int levelEnd = tail;
        while (head < levelEnd) {
            int r = queue[head++], c = queue[head++];
            for (int d = 0; d < 4; d++) {
                int nr = r + dirs[d][0];
                int nc = c + dirs[d][1];
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 1) {
                    grid[nr][nc] = 2;
                    fresh--;
                    queue[tail++] = nr;
                    queue[tail++] = nc;
                }
            }
        }
        minutes++;
    }
    free(queue);
    return fresh == 0 ? minutes : -1;
}
