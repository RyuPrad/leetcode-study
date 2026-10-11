int maxProfit(int* prices, int pricesSize) {
    int left = 0;
    int ans = 0;
    for (int right = 1; right < pricesSize; right++) {
        if (prices[right] < prices[left]) {
            left = right;
        } else if (prices[right] - prices[left] > ans) {
            ans = prices[right] - prices[left];
        }
    }
    return ans;
}
