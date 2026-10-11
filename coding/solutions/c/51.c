static char*** res;
static int count, capacity;
static char board[10][11];
static bool cols[10], diag[20], antiDiag[20];

static void dfs(int n, int r) {
    if (r == n) {
        if (count == capacity) { capacity *= 2; res = realloc(res, capacity * sizeof(char**)); }
        res[count] = malloc(n * sizeof(char*));
        for (int i = 0; i < n; i++) {
            res[count][i] = malloc(n + 1);
            memcpy(res[count][i], board[i], n + 1);
        }
        count++;
        return;
    }
    for (int c = 0; c < n; c++) {
        if (cols[c] || diag[r - c + n] || antiDiag[r + c]) continue;
        cols[c] = diag[r - c + n] = antiDiag[r + c] = true;
        board[r][c] = 'Q';
        dfs(n, r + 1);
        cols[c] = diag[r - c + n] = antiDiag[r + c] = false;
        board[r][c] = '.';
    }
}

char*** solveNQueens(int n, int* returnSize, int** returnColumnSizes) {
    count = 0;
    capacity = 16;
    res = malloc(capacity * sizeof(char**));
    for (int i = 0; i < n; i++) {
        memset(board[i], '.', n);
        board[i][n] = '\0';
    }
    dfs(n, 0);
    *returnSize = count;
    *returnColumnSizes = malloc((count ? count : 1) * sizeof(int));
    for (int i = 0; i < count; i++) (*returnColumnSizes)[i] = n;
    return res;
}
