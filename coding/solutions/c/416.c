bool canPartition(int* nums, int numsSize) {
    int total = 0;
    for (int i = 0; i < numsSize; i++) total += nums[i];
    if (total % 2 != 0) return false;
    int target = total / 2;
    bool* dp = calloc(target + 1, sizeof(bool));
    dp[0] = true;
    for (int k = 0; k < numsSize; k++) {
        for (int i = target; i >= nums[k]; i--) {
            if (dp[i - nums[k]]) dp[i] = true;
        }
    }
    bool result = dp[target];
    free(dp);
    return result;
}
