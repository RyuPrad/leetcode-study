int findTargetSumWays(int* nums, int numsSize, int target) {
    int total = 0;
    for (int i = 0; i < numsSize; i++) total += nums[i];
    if (abs(target) > total || (total + target) % 2 != 0) return 0;
    int subsetSum = (total + target) / 2;
    int* dp = calloc(subsetSum + 1, sizeof(int));
    dp[0] = 1;
    for (int i = 0; i < numsSize; i++) {
        for (int s = subsetSum; s >= nums[i]; s--) {
            dp[s] += dp[s - nums[i]];
        }
    }
    int result = dp[subsetSum];
    free(dp);
    return result;
}
