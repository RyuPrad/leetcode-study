static int count;
static bool cols[10], diag[20], antiDiag[20];

static void dfs(int n, int r) {
    if (r == n) { count++; return; }
    for (int c = 0; c < n; c++) {
        if (cols[c] || diag[r - c + n] || antiDiag[r + c]) continue;
        cols[c] = diag[r - c + n] = antiDiag[r + c] = true;
        dfs(n, r + 1);
        cols[c] = diag[r - c + n] = antiDiag[r + c] = false;
    }
}

int totalNQueens(int n) {
    count = 0;
    dfs(n, 0);
    return count;
}
