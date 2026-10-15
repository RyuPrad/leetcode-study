int minCost(int** costs, int costsSize, int* costsColSize) {
    int dp[3] = {costs[0][0], costs[0][1], costs[0][2]};
    for (int i = 1; i < costsSize; i++) {
        int red = costs[i][0] + (dp[1] < dp[2] ? dp[1] : dp[2]);
        int blue = costs[i][1] + (dp[0] < dp[2] ? dp[0] : dp[2]);
        int green = costs[i][2] + (dp[0] < dp[1] ? dp[0] : dp[1]);
        dp[0] = red;
        dp[1] = blue;
        dp[2] = green;
    }
    int res = dp[0] < dp[1] ? dp[0] : dp[1];
    return res < dp[2] ? res : dp[2];
}
