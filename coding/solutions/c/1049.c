int lastStoneWeightII(int* stones, int stonesSize) {
    int total = 0;
    for (int i = 0; i < stonesSize; i++) total += stones[i];
    int target = total / 2;
    int* dp = calloc(target + 1, sizeof(int));
    for (int i = 0; i < stonesSize; i++) {
        for (int j = target; j >= stones[i]; j--) {
            if (dp[j - stones[i]] + stones[i] > dp[j]) dp[j] = dp[j - stones[i]] + stones[i];
        }
    }
    int result = total - 2 * dp[target];
    free(dp);
    return result;
}
