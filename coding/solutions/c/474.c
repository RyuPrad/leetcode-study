int findMaxForm(char** strs, int strsSize, int m, int n) {
    int** dp = malloc((m + 1) * sizeof(int*));
    for (int i = 0; i <= m; i++) {
        dp[i] = calloc(n + 1, sizeof(int));
    }
    for (int s = 0; s < strsSize; s++) {
        int zeros = 0, length = strlen(strs[s]);
        for (int k = 0; k < length; k++) {
            if (strs[s][k] == '0') zeros++;
        }
        int ones = length - zeros;
        for (int i = m; i >= zeros; i--) {
            for (int j = n; j >= ones; j--) {
                if (dp[i - zeros][j - ones] + 1 > dp[i][j]) {
                    dp[i][j] = dp[i - zeros][j - ones] + 1;
                }
            }
        }
    }
    int res = dp[m][n];
    for (int i = 0; i <= m; i++) {
        free(dp[i]);
    }
    free(dp);
    return res;
}
