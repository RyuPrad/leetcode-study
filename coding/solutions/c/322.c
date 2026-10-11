int coinChange(int* coins, int coinsSize, int amount) {
    const int INF = INT_MAX - 1;
    int* dp = malloc((amount + 1) * sizeof(int));
    dp[0] = 0;
    for (int a = 1; a <= amount; a++) {
        dp[a] = INF;
        for (int i = 0; i < coinsSize; i++) {
            if (coins[i] <= a && dp[a - coins[i]] + 1 < dp[a]) dp[a] = dp[a - coins[i]] + 1;
        }
    }
    int result = dp[amount] == INF ? -1 : dp[amount];
    free(dp);
    return result;
}
