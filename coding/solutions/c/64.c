int minPathSum(int** grid, int gridSize, int* gridColSize) {
    int m = gridSize, n = gridColSize[0];
    int* dp = malloc(m * n * sizeof(int));
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            int here = grid[i][j];
            if (i == 0 && j == 0) dp[0] = here;
            else if (i == 0) dp[j] = dp[j - 1] + here;
            else if (j == 0) dp[i * n] = dp[(i - 1) * n] + here;
            else {
                int up = dp[(i - 1) * n + j], left = dp[i * n + j - 1];
                dp[i * n + j] = (up < left ? up : left) + here;
            }
        }
    }
    int result = dp[m * n - 1];
    free(dp);
    return result;
}
