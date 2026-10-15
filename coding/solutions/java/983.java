class Solution {
    public int mincostTickets(int[] days, int[] costs) {
        int last = days[days.length - 1];
        boolean[] travel = new boolean[last + 1];
        for (int d : days) {
            travel[d] = true;
        }
        int[] dp = new int[last + 1];
        for (int d = 1; d <= last; d++) {
            if (!travel[d]) {
                dp[d] = dp[d - 1];
                continue;
            }
            int day = dp[d - 1] + costs[0];
            int week = dp[Math.max(0, d - 7)] + costs[1];
            int month = dp[Math.max(0, d - 30)] + costs[2];
            dp[d] = Math.min(day, Math.min(week, month));
        }
        return dp[last];
    }
}
