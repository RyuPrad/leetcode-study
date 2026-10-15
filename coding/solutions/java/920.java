class Solution {
    public int numMusicPlaylists(int n, int goal, int k) {
        final long MOD = 1000000007;
        long[][] dp = new long[goal + 1][n + 1];
        dp[0][0] = 1;
        for (int i = 1; i <= goal; i++) {
            for (int j = 1; j <= Math.min(i, n); j++) {
                long fresh = dp[i - 1][j - 1] * (n - j + 1);
                long replay = dp[i - 1][j] * Math.max(j - k, 0);
                dp[i][j] = (fresh + replay) % MOD;
            }
        }
        return (int) dp[goal][n];
    }
}
