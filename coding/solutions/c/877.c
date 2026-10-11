bool stoneGame(int* piles, int pilesSize) {
    int n = pilesSize;
    int* dp = calloc(n * n, sizeof(int));
    for (int i = 0; i < n; i++) dp[i * n + i] = piles[i];
    for (int len = 2; len <= n; len++) {
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            int takeLeft = piles[i] - dp[(i + 1) * n + j], takeRight = piles[j] - dp[i * n + j - 1];
            dp[i * n + j] = takeLeft > takeRight ? takeLeft : takeRight;
        }
    }
    bool result = dp[n - 1] > 0;
    free(dp);
    return result;
}
