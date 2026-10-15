class Solution {
    public int maximalSquare(char[][] matrix) {
        int m = matrix.length, n = matrix[0].length;
        int[][] dp = new int[m + 1][n + 1];
        int side = 0;
        for (int r = 1; r <= m; r++) {
            for (int c = 1; c <= n; c++) {
                if (matrix[r - 1][c - 1] == '1') {
                    dp[r][c] = 1 + Math.min(dp[r - 1][c], Math.min(dp[r][c - 1], dp[r - 1][c - 1]));
                    side = Math.max(side, dp[r][c]);
                }
            }
        }
        return side * side;
    }
}
