class Solution {
    public int change(int amount, int[] coins) {
        int n = coins.length;
        long[][] dp = new long[n + 1][amount + 1];
        for (int i = 0; i <= n; i++) dp[i][0] = 1;
        for (int i = 1; i <= n; i++) {
            for (int a = 1; a <= amount; a++) {
                dp[i][a] = dp[i - 1][a];
                if (a >= coins[i - 1]) dp[i][a] += dp[i][a - coins[i - 1]];
            }
        }
        return (int) dp[n][amount];
    }
}
