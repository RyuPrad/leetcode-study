class Solution {
    public int rearrangeSticks(int n, int k) {
        final long MOD = 1000000007;
        long[][] dp = new long[n + 1][k + 1];
        dp[0][0] = 1;
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= Math.min(i, k); j++) {
                dp[i][j] = (dp[i - 1][j - 1] + (i - 1) * dp[i - 1][j]) % MOD;
            }
        }
        return (int) dp[n][k];
    }
}
