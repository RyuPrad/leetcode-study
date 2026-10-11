class Solution {
    public int maxProfit(int[] prices) {
        int left = 0;
        int ans = 0;
        for (int right = 1; right < prices.length; right++) {
            if (prices[right] < prices[left]) {
                left = right;
            } else {
                ans = Math.max(ans, prices[right] - prices[left]);
            }
        }
        return ans;
    }
}
