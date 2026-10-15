int countGoodStrings(int low, int high, int zero, int one) {
    const int MOD = 1000000007;
    int* dp = calloc(high + 1, sizeof(int));
    dp[0] = 1;
    int res = 0;
    for (int len = 1; len <= high; len++) {
        if (len >= zero) {
            dp[len] = (dp[len] + dp[len - zero]) % MOD;
        }
        if (len >= one) {
            dp[len] = (dp[len] + dp[len - one]) % MOD;
        }
        if (len >= low) {
            res = (res + dp[len]) % MOD;
        }
    }
    free(dp);
    return res;
}
