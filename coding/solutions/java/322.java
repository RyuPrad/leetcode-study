class Solution {
    public int coinChange(int[] coins, int amount) {
        final int INF = Integer.MAX_VALUE - 1;
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, INF);
        dp[0] = 0;
        for (int a = 1; a <= amount; a++) {
            for (int coin : coins) {
                if (coin <= a) dp[a] = Math.min(dp[a], dp[a - coin] + 1);
            }
        }
        return dp[amount] == INF ? -1 : dp[amount];
    }
}
