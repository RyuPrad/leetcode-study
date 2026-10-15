int maxValueOfCoins(int** piles, int pilesSize, int* pilesColSize, int k) {
    int* dp = calloc(k + 1, sizeof(int));
    int* next = malloc((k + 1) * sizeof(int));
    for (int p = 0; p < pilesSize; p++) {
        memcpy(next, dp, (k + 1) * sizeof(int));
        int taken = 0;
        int limit = pilesColSize[p] < k ? pilesColSize[p] : k;
        for (int t = 1; t <= limit; t++) {
            taken += piles[p][t - 1];
            for (int used = t; used <= k; used++) {
                if (dp[used - t] + taken > next[used]) {
                    next[used] = dp[used - t] + taken;
                }
            }
        }
        int* swap = dp;
        dp = next;
        next = swap;
    }
    int res = dp[k];
    free(dp);
    free(next);
    return res;
}
