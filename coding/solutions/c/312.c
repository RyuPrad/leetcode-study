int maxCoins(int* nums, int numsSize) {
    int n = numsSize + 2;
    int* balloons = malloc(n * sizeof(int));
    balloons[0] = balloons[n - 1] = 1;
    for (int i = 0; i < numsSize; i++) balloons[i + 1] = nums[i];
    int* dp = calloc(n * n, sizeof(int));
    for (int len = 2; len < n; len++) {
        for (int left = 0; left + len < n; left++) {
            int right = left + len;
            for (int k = left + 1; k < right; k++) {
                int coins = balloons[left] * balloons[k] * balloons[right] + dp[left * n + k] + dp[k * n + right];
                if (coins > dp[left * n + right]) dp[left * n + right] = coins;
            }
        }
    }
    int result = dp[n - 1];
    free(dp);
    free(balloons);
    return result;
}
