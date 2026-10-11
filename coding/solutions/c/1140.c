int stoneGameII(int* piles, int pilesSize) {
    int n = pilesSize;
    int* suffix = calloc(n + 1, sizeof(int));
    for (int i = n - 1; i >= 0; i--) suffix[i] = suffix[i + 1] + piles[i];
    int* dp = calloc(n * (n + 1), sizeof(int));
#define DP(i, m) dp[(i) * (n + 1) + (m)]
    for (int i = n - 1; i >= 0; i--) {
        for (int m = 1; m <= n; m++) {
            if (i + 2 * m >= n) {
                DP(i, m) = suffix[i];
            } else {
                int best = 0;
                for (int x = 1; x <= 2 * m; x++) {
                    int take = suffix[i] - DP(i + x, m > x ? m : x);
                    if (take > best) best = take;
                }
                DP(i, m) = best;
            }
        }
    }
    int result = DP(0, 1);
#undef DP
    free(dp);
    free(suffix);
    return result;
}
