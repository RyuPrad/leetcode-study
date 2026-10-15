class Solution {
    public boolean validPartition(int[] nums) {
        int n = nums.length;
        boolean[] dp = new boolean[n + 1];
        dp[0] = true;
        for (int i = 2; i <= n; i++) {
            int a = nums[i - 1], b = nums[i - 2];
            if (a == b && dp[i - 2]) {
                dp[i] = true;
            }
            if (i >= 3 && dp[i - 3]) {
                int c = nums[i - 3];
                if ((a == b && b == c) || (a == b + 1 && b == c + 1)) {
                    dp[i] = true;
                }
            }
        }
        return dp[n];
    }
}
