static int min3(int a, int b, int c) { int m = a < b ? a : b; return m < c ? m : c; }

int minDistance(char* word1, char* word2) {
    int m = strlen(word1), n = strlen(word2);
    int* dp = malloc((m + 1) * (n + 1) * sizeof(int));
#define DP(i, j) dp[(i) * (n + 1) + (j)]
    for (int i = 0; i <= m; i++) DP(i, 0) = i;
    for (int j = 0; j <= n; j++) DP(0, j) = j;
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (word1[i - 1] == word2[j - 1]) DP(i, j) = DP(i - 1, j - 1);
            else DP(i, j) = 1 + min3(DP(i - 1, j), DP(i, j - 1), DP(i - 1, j - 1));
        }
    }
    int result = DP(m, n);
#undef DP
    free(dp);
    return result;
}
