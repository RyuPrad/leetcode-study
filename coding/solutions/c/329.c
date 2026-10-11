static const int DIRS[4][2] = { { -1, 0 }, { 1, 0 }, { 0, -1 }, { 0, 1 } };
static int* memo;
static int rows, cols;

static int dfs(int** matrix, int r, int c) {
    if (memo[r * cols + c] != 0) return memo[r * cols + c];
    int best = 1;
    for (int d = 0; d < 4; d++) {
        int nr = r + DIRS[d][0], nc = c + DIRS[d][1];
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && matrix[nr][nc] > matrix[r][c]) {
            int length = 1 + dfs(matrix, nr, nc);
            if (length > best) best = length;
        }
    }
    memo[r * cols + c] = best;
    return best;
}

int longestIncreasingPath(int** matrix, int matrixSize, int* matrixColSize) {
    rows = matrixSize;
    cols = matrixColSize[0];
    memo = calloc(rows * cols, sizeof(int));
    int ans = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            int length = dfs(matrix, r, c);
            if (length > ans) ans = length;
        }
    }
    free(memo);
    return ans;
}
