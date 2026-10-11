bool isInterleave(char* s1, char* s2, char* s3) {
    int m = strlen(s1), n = strlen(s2);
    if (m + n != (int)strlen(s3)) return false;
    bool* dp = calloc((m + 1) * (n + 1), sizeof(bool));
#define DP(i, j) dp[(i) * (n + 1) + (j)]
    DP(0, 0) = true;
    for (int i = 0; i <= m; i++) {
        for (int j = 0; j <= n; j++) {
            if (i > 0 && DP(i - 1, j) && s1[i - 1] == s3[i + j - 1]) DP(i, j) = true;
            if (j > 0 && DP(i, j - 1) && s2[j - 1] == s3[i + j - 1]) DP(i, j) = true;
        }
    }
    bool result = DP(m, n);
#undef DP
    free(dp);
    return result;
}
