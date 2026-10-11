int uniquePathsWithObstacles(int** grid, int gridSize, int* gridColSize) {
    int m = gridSize, n = gridColSize[0];
    int* dp = calloc(m * n, sizeof(int));
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (grid[i][j] == 1) { dp[i * n + j] = 0; continue; }
            if (i == 0 && j == 0) { dp[0] = 1; continue; }
            if (i > 0) dp[i * n + j] += dp[(i - 1) * n + j];
            if (j > 0) dp[i * n + j] += dp[i * n + j - 1];
        }
    }
    int result = dp[m * n - 1];
    free(dp);
    return result;
}
