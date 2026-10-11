int numDistinct(char* s, char* t) {
    int m = strlen(s), n = strlen(t);
    // Intermediate counts can exceed int even when the answer fits.
    double* dp = calloc((m + 1) * (n + 1), sizeof(double));
#define DP(i, j) dp[(i) * (n + 1) + (j)]
    for (int i = 0; i <= m; i++) DP(i, 0) = 1;
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            DP(i, j) = DP(i - 1, j);
            if (s[i - 1] == t[j - 1]) DP(i, j) += DP(i - 1, j - 1);
        }
    }
    int result = (int)DP(m, n);
#undef DP
    free(dp);
    return result;
}
