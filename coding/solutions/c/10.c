bool isMatch(char* s, char* p) {
    int m = strlen(s), n = strlen(p);
    bool* dp = calloc((m + 1) * (n + 1), sizeof(bool));
#define DP(i, j) dp[(i) * (n + 1) + (j)]
    DP(0, 0) = true;
    for (int j = 1; j <= n; j++) {
        if (p[j - 1] == '*') DP(0, j) = DP(0, j - 2);
    }
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (p[j - 1] == '*') {
                DP(i, j) = DP(i, j - 2);
                if (p[j - 2] == '.' || p[j - 2] == s[i - 1]) {
                    DP(i, j) = DP(i, j) || DP(i - 1, j);
                }
            } else if (p[j - 1] == '.' || p[j - 1] == s[i - 1]) {
                DP(i, j) = DP(i - 1, j - 1);
            }
        }
    }
    bool result = DP(m, n);
#undef DP
    free(dp);
    return result;
}
