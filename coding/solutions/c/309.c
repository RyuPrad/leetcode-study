static int max(int a, int b) { return a > b ? a : b; }

int maxProfit(int* prices, int pricesSize) {
    int n = pricesSize;
    if (n == 0) return 0;
    int* hold = calloc(n, sizeof(int));
    int* sold = calloc(n, sizeof(int));
    int* rest = calloc(n, sizeof(int));
    hold[0] = -prices[0];
    for (int i = 1; i < n; i++) {
        hold[i] = max(hold[i - 1], rest[i - 1] - prices[i]);
        sold[i] = hold[i - 1] + prices[i];
        rest[i] = max(rest[i - 1], sold[i - 1]);
    }
    int result = max(sold[n - 1], rest[n - 1]);
    free(hold); free(sold); free(rest);
    return result;
}
