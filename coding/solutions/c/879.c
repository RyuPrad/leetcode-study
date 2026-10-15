int profitableSchemes(int n, int minProfit, int* group, int groupSize, int* profit, int profitSize) {
    const int MOD = 1000000007;
    int** dp = malloc((n + 1) * sizeof(int*));
    for (int i = 0; i <= n; i++) {
        dp[i] = calloc(minProfit + 1, sizeof(int));
    }
    dp[0][0] = 1;
    for (int c = 0; c < groupSize; c++) {
        int g = group[c], p = profit[c];
        for (int members = n; members >= g; members--) {
            for (int earned = minProfit; earned >= 0; earned--) {
                int capped = earned + p < minProfit ? earned + p : minProfit;
                dp[members][capped] = (dp[members][capped] + dp[members - g][earned]) % MOD;
            }
        }
    }
    int res = 0;
    for (int members = 0; members <= n; members++) {
        res = (res + dp[members][minProfit]) % MOD;
    }
    for (int i = 0; i <= n; i++) {
        free(dp[i]);
    }
    free(dp);
    return res;
}
