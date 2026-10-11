int lengthOfLIS(int* nums, int numsSize) {
    int n = numsSize;
    int* dp = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) dp[i] = 1;
    int ans = 1;
    for (int i = 1; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[j] < nums[i] && dp[j] + 1 > dp[i]) dp[i] = dp[j] + 1;
        }
        if (dp[i] > ans) ans = dp[i];
    }
    free(dp);
    return ans;
}
