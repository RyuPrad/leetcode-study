int change(int amount, int* coins, int coinsSize) {
    int n = coinsSize;
    long long* dp = calloc((n + 1) * (amount + 1), sizeof(long long));
#define DP(i, a) dp[(i) * (amount + 1) + (a)]
    for (int i = 0; i <= n; i++) DP(i, 0) = 1;
    for (int i = 1; i <= n; i++) {
        for (int a = 1; a <= amount; a++) {
            DP(i, a) = DP(i - 1, a);
            if (a >= coins[i - 1]) DP(i, a) += DP(i, a - coins[i - 1]);
        }
    }
    int result = (int)DP(n, amount);
#undef DP
    free(dp);
    return result;
}
