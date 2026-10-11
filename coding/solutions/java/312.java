class Solution {
    public int maxCoins(int[] nums) {
        int n = nums.length + 2;
        int[] balloons = new int[n];
        balloons[0] = balloons[n - 1] = 1;
        for (int i = 0; i < nums.length; i++) balloons[i + 1] = nums[i];
        int[][] dp = new int[n][n];
        for (int len = 2; len < n; len++) {
            for (int left = 0; left + len < n; left++) {
                int right = left + len;
                for (int k = left + 1; k < right; k++) {
                    dp[left][right] = Math.max(
                        dp[left][right],
                        balloons[left] * balloons[k] * balloons[right] + dp[left][k] + dp[k][right]
                    );
                }
            }
        }
        return dp[0][n - 1];
    }
}
