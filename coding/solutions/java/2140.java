class Solution {
    public long mostPoints(int[][] questions) {
        int n = questions.length;
        long[] dp = new long[n + 1];
        for (int i = n - 1; i >= 0; i--) {
            int points = questions[i][0], skip = questions[i][1];
            long solve = points + dp[Math.min(n, i + skip + 1)];
            dp[i] = Math.max(solve, dp[i + 1]);
        }
        return dp[0];
    }
}
