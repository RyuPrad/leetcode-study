int minCostClimbingStairs(int* cost, int costSize) {
    int n = costSize;
    int* dp = calloc(n + 1, sizeof(int));
    for (int i = 2; i <= n; i++) {
        int one = dp[i - 1] + cost[i - 1], two = dp[i - 2] + cost[i - 2];
        dp[i] = one < two ? one : two;
    }
    int result = dp[n];
    free(dp);
    return result;
}
