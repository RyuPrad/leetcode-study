class Solution {
    public int profitableSchemes(int n, int minProfit, int[] group, int[] profit) {
        final int MOD = 1000000007;
        int[][] dp = new int[n + 1][minProfit + 1];
        dp[0][0] = 1;
        for (int c = 0; c < group.length; c++) {
            int g = group[c], p = profit[c];
            for (int members = n; members >= g; members--) {
                for (int earned = minProfit; earned >= 0; earned--) {
                    int capped = Math.min(minProfit, earned + p);
                    dp[members][capped] = (dp[members][capped] + dp[members - g][earned]) % MOD;
                }
            }
        }
        int res = 0;
        for (int members = 0; members <= n; members++) {
            res = (res + dp[members][minProfit]) % MOD;
        }
        return res;
    }
}
