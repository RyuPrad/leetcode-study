int countOrders(int n) {
    const long long MOD = 1000000007;
    long long res = 1;
    for (int i = 2; i <= n; i++) {
        long long slots = 2LL * i - 1;
        res = res * (slots * (slots + 1) / 2) % MOD;
    }
    return (int) res;
}
