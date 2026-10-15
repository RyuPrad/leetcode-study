int numMusicPlaylists(int n, int goal, int k) {
    const long long MOD = 1000000007;
    long long** dp = malloc((goal + 1) * sizeof(long long*));
    for (int i = 0; i <= goal; i++) {
        dp[i] = calloc(n + 1, sizeof(long long));
    }
    dp[0][0] = 1;
    for (int i = 1; i <= goal; i++) {
        for (int j = 1; j <= (i < n ? i : n); j++) {
            long long fresh = dp[i - 1][j - 1] * (n - j + 1);
            long long replay = dp[i - 1][j] * (j > k ? j - k : 0);
            dp[i][j] = (fresh + replay) % MOD;
        }
    }
    int res = (int) dp[goal][n];
    for (int i = 0; i <= goal; i++) {
        free(dp[i]);
    }
    free(dp);
    return res;
}
