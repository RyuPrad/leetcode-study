class Solution {
    public int numWays(String[] words, String target) {
        final long MOD = 1000000007;
        int len = words[0].length(), m = target.length();
        int[][] count = new int[len][26];
        for (String word : words) {
            for (int c = 0; c < len; c++) {
                count[c][word.charAt(c) - 'a']++;
            }
        }
        long[] dp = new long[m + 1];
        dp[0] = 1;
        for (int c = 0; c < len; c++) {
            for (int t = Math.min(m, c + 1); t >= 1; t--) {
                int ways = count[c][target.charAt(t - 1) - 'a'];
                dp[t] = (dp[t] + dp[t - 1] * ways) % MOD;
            }
        }
        return (int) dp[m];
    }
}
