class Solution {
    public int lastStoneWeightII(int[] stones) {
        int total = Arrays.stream(stones).sum();
        int target = total / 2;
        int[] dp = new int[target + 1];
        for (int stone : stones) {
            for (int j = target; j >= stone; j--) {
                dp[j] = Math.max(dp[j], dp[j - stone] + stone);
            }
        }
        return total - 2 * dp[target];
    }
}
