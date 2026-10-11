class Solution {
    private int count = 0;
    private final Set<Integer> cols = new HashSet<>(), diag = new HashSet<>(), antiDiag = new HashSet<>();

    public int totalNQueens(int n) {
        dfs(n, 0);
        return count;
    }

    private void dfs(int n, int r) {
        if (r == n) { count++; return; }
        for (int c = 0; c < n; c++) {
            if (cols.contains(c) || diag.contains(r - c) || antiDiag.contains(r + c)) continue;
            cols.add(c); diag.add(r - c); antiDiag.add(r + c);
            dfs(n, r + 1);
            cols.remove(c); diag.remove(r - c); antiDiag.remove(r + c);
        }
    }
}
