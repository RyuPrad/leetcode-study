class Solution {
    public int minCost(int[][] costs) {
        int[] dp = costs[0].clone();
        for (int i = 1; i < costs.length; i++) {
            int red = costs[i][0] + Math.min(dp[1], dp[2]);
            int blue = costs[i][1] + Math.min(dp[0], dp[2]);
            int green = costs[i][2] + Math.min(dp[0], dp[1]);
            dp = new int[] {red, blue, green};
        }
        return Math.min(dp[0], Math.min(dp[1], dp[2]));
    }
}
