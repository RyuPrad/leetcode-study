class Solution {
    public int countOrders(int n) {
        final long MOD = 1000000007;
        long res = 1;
        for (int i = 2; i <= n; i++) {
            long slots = 2L * i - 1;
            res = res * (slots * (slots + 1) / 2) % MOD;
        }
        return (int) res;
    }
}
