class Solution {
    public int combinationSum4(int[] nums, int target) {
        // Unused intermediate counts can overflow; the answer itself fits in an int.
        long[] dp = new long[target + 1];
        dp[0] = 1;
        for (int t = 1; t <= target; t++) {
            for (int num : nums) {
                if (num <= t) dp[t] = (dp[t] + dp[t - num]) & 0xFFFFFFFFL;
            }
        }
        return (int) dp[target];
    }
}
