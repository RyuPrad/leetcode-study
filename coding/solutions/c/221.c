int maximalSquare(char** matrix, int matrixSize, int* matrixColSize) {
    int m = matrixSize, n = matrixColSize[0];
    int** dp = malloc((m + 1) * sizeof(int*));
    for (int r = 0; r <= m; r++) {
        dp[r] = calloc(n + 1, sizeof(int));
    }
    int side = 0;
    for (int r = 1; r <= m; r++) {
        for (int c = 1; c <= n; c++) {
            if (matrix[r - 1][c - 1] == '1') {
                int best = dp[r - 1][c] < dp[r][c - 1] ? dp[r - 1][c] : dp[r][c - 1];
                if (dp[r - 1][c - 1] < best) best = dp[r - 1][c - 1];
                dp[r][c] = 1 + best;
                if (dp[r][c] > side) side = dp[r][c];
            }
        }
    }
    for (int r = 0; r <= m; r++) {
        free(dp[r]);
    }
    free(dp);
    return side * side;
}
