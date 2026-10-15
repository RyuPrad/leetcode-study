int maxDistance(int** grid, int gridSize, int* gridColSize) {
    int n = gridSize;
    int* dist = malloc(n * n * sizeof(int));
    int* queue = malloc(n * n * sizeof(int));
    int size = 0;
    for (int r = 0; r < n; r++) {
        for (int c = 0; c < n; c++) {
            dist[r * n + c] = grid[r][c] == 1 ? 0 : -1;
            if (grid[r][c] == 1) {
                queue[size++] = r * n + c;
            }
        }
    }
    int res = -1;
    if (size > 0 && size < n * n) {
        int dirs[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        res = 0;
        for (int head = 0; head < size; head++) {
            int r = queue[head] / n, c = queue[head] % n;
            for (int d = 0; d < 4; d++) {
                int nr = r + dirs[d][0], nc = c + dirs[d][1];
                if (nr >= 0 && nr < n && nc >= 0 && nc < n && dist[nr * n + nc] == -1) {
                    dist[nr * n + nc] = dist[r * n + c] + 1;
                    if (dist[nr * n + nc] > res) res = dist[nr * n + nc];
                    queue[size++] = nr * n + nc;
                }
            }
        }
    }
    free(dist);
    free(queue);
    return res;
}
