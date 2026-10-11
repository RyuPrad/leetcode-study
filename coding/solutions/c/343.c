int integerBreak(int n) {
    int* dp = calloc(n + 1, sizeof(int));
    dp[1] = 1;
    for (int i = 2; i <= n; i++) {
        for (int j = 1; j < i; j++) {
            int split = j * (i - j), deeper = j * dp[i - j];
            if (split > dp[i]) dp[i] = split;
            if (deeper > dp[i]) dp[i] = deeper;
        }
    }
    int result = dp[n];
    free(dp);
    return result;
}
