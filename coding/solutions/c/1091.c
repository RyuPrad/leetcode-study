int shortestPathBinaryMatrix(int** grid, int gridSize, int* gridColSize) {
    int n = gridSize;
    if (grid[0][0] == 1 || grid[n - 1][n - 1] == 1) {
        return -1;
    }
    int* dist = calloc(n * n, sizeof(int));
    dist[0] = 1;
    int* queue = malloc(n * n * sizeof(int));
    int size = 0, res = -1;
    queue[size++] = 0;
    for (int head = 0; head < size; head++) {
        int r = queue[head] / n, c = queue[head] % n;
        if (r == n - 1 && c == n - 1) {
            res = dist[r * n + c];
            break;
        }
        for (int dr = -1; dr <= 1; dr++) {
            for (int dc = -1; dc <= 1; dc++) {
                int nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] == 0 && dist[nr * n + nc] == 0) {
                    dist[nr * n + nc] = dist[r * n + c] + 1;
                    queue[size++] = nr * n + nc;
                }
            }
        }
    }
    free(dist);
    free(queue);
    return res;
}
