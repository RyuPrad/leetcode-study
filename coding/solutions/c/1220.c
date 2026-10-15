int countVowelPermutation(int n) {
    const long long MOD = 1000000007;
    long long a = 1, e = 1, i = 1, o = 1, u = 1;
    for (int len = 2; len <= n; len++) {
        long long na = (e + i + u) % MOD;
        long long ne = (a + i) % MOD;
        long long ni = (e + o) % MOD;
        long long no = i;
        long long nu = (i + o) % MOD;
        a = na;
        e = ne;
        i = ni;
        o = no;
        u = nu;
    }
    return (int) ((a + e + i + o + u) % MOD);
}
