int minimumTotal(int** triangle, int triangleSize, int* triangleColSize) {
    int n = triangleSize;
    int* dp = malloc(n * sizeof(int));
    for (int c = 0; c < n; c++) {
        dp[c] = triangle[n - 1][c];
    }
    for (int r = n - 2; r >= 0; r--) {
        for (int c = 0; c <= r; c++) {
            int below = dp[c] < dp[c + 1] ? dp[c] : dp[c + 1];
            dp[c] = triangle[r][c] + below;
        }
    }
    int res = dp[0];
    free(dp);
    return res;
}
