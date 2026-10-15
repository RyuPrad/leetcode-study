class Solution {
    public int minCost(int n, int[] cuts) {
        Arrays.sort(cuts);
        int m = cuts.length + 2;
        int[] points = new int[m];
        points[m - 1] = n;
        for (int i = 0; i < cuts.length; i++) {
            points[i + 1] = cuts[i];
        }
        int[][] dp = new int[m][m];
        for (int gap = 2; gap < m; gap++) {
            for (int left = 0; left + gap < m; left++) {
                int right = left + gap;
                int best = Integer.MAX_VALUE;
                for (int mid = left + 1; mid < right; mid++) {
                    best = Math.min(best, dp[left][mid] + dp[mid][right]);
                }
                dp[left][right] = best + points[right] - points[left];
            }
        }
        return dp[0][m - 1];
    }
}
