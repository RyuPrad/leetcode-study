char* stoneGameIII(int* stoneValue, int stoneValueSize) {
    int n = stoneValueSize;
    int* dp = calloc(n + 1, sizeof(int));
    for (int i = n - 1; i >= 0; i--) {
        int take = 0;
        dp[i] = INT_MIN;
        for (int k = 0; k < 3 && i + k < n; k++) {
            take += stoneValue[i + k];
            if (take - dp[i + k + 1] > dp[i]) dp[i] = take - dp[i + k + 1];
        }
    }
    const char* winner = dp[0] > 0 ? "Alice" : dp[0] < 0 ? "Bob" : "Tie";
    free(dp);
    char* res = malloc(6);
    strcpy(res, winner);
    return res;
}
