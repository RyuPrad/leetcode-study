class Solution {
    private final List<List<String>> res = new ArrayList<>();
    private final Set<Integer> cols = new HashSet<>(), diag = new HashSet<>(), antiDiag = new HashSet<>();
    private char[][] board;

    public List<List<String>> solveNQueens(int n) {
        board = new char[n][n];
        for (char[] row : board) Arrays.fill(row, '.');
        dfs(n, 0);
        return res;
    }

    private void dfs(int n, int r) {
        if (r == n) {
            List<String> rows = new ArrayList<>();
            for (char[] row : board) rows.add(new String(row));
            res.add(rows);
            return;
        }
        for (int c = 0; c < n; c++) {
            if (cols.contains(c) || diag.contains(r - c) || antiDiag.contains(r + c)) continue;
            cols.add(c); diag.add(r - c); antiDiag.add(r + c);
            board[r][c] = 'Q';
            dfs(n, r + 1);
            cols.remove(c); diag.remove(r - c); antiDiag.remove(r + c);
            board[r][c] = '.';
        }
    }
}
