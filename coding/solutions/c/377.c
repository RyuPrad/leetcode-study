int combinationSum4(int* nums, int numsSize, int target) {
    // Unused intermediate counts can overflow; unsigned arithmetic wraps safely.
    unsigned int* dp = calloc(target + 1, sizeof(unsigned int));
    dp[0] = 1;
    for (int t = 1; t <= target; t++) {
        for (int i = 0; i < numsSize; i++) {
            if (nums[i] <= t) dp[t] += dp[t - nums[i]];
        }
    }
    int result = (int)dp[target];
    free(dp);
    return result;
}
