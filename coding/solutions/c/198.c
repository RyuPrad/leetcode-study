int rob(int* nums, int numsSize) {
    int n = numsSize;
    if (n == 1) return nums[0];
    int* dp = malloc(n * sizeof(int));
    dp[0] = nums[0];
    dp[1] = nums[0] > nums[1] ? nums[0] : nums[1];
    for (int i = 2; i < n; i++) {
        int take = dp[i - 2] + nums[i];
        dp[i] = dp[i - 1] > take ? dp[i - 1] : take;
    }
    int result = dp[n - 1];
    free(dp);
    return result;
}
