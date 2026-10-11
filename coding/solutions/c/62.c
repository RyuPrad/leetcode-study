int uniquePaths(int m, int n) {
    int* dp = malloc(m * n * sizeof(int));
    for (int k = 0; k < m * n; k++) dp[k] = 1;
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            dp[i * n + j] = dp[(i - 1) * n + j] + dp[i * n + j - 1];
        }
    }
    int result = dp[m * n - 1];
    free(dp);
    return result;
}
