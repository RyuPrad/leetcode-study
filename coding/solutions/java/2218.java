class Solution {
    public int maxValueOfCoins(List<List<Integer>> piles, int k) {
        int[] dp = new int[k + 1];
        for (List<Integer> pile : piles) {
            int[] next = dp.clone();
            int taken = 0;
            for (int t = 1; t <= Math.min(pile.size(), k); t++) {
                taken += pile.get(t - 1);
                for (int used = t; used <= k; used++) {
                    next[used] = Math.max(next[used], dp[used - t] + taken);
                }
            }
            dp = next;
        }
        return dp[k];
    }
}
