int rearrangeSticks(int n, int k) {
    const long long MOD = 1000000007;
    long long** dp = malloc((n + 1) * sizeof(long long*));
    for (int i = 0; i <= n; i++) {
        dp[i] = calloc(k + 1, sizeof(long long));
    }
    dp[0][0] = 1;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= (i < k ? i : k); j++) {
            dp[i][j] = (dp[i - 1][j - 1] + (i - 1) * dp[i - 1][j]) % MOD;
        }
    }
    int res = (int) dp[n][k];
    for (int i = 0; i <= n; i++) {
        free(dp[i]);
    }
    free(dp);
    return res;
}
