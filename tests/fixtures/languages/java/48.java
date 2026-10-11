class Solution {
    public void rotate(int[][] matrix) {
        int n = matrix.length;
        for (int i = 0; i < n; i++) for (int j = i + 1; j < n; j++) { int t = matrix[i][j]; matrix[i][j] = matrix[j][i]; matrix[j][i] = t; }
        for (int[] row : matrix) for (int j = 0; j < n / 2; j++) { int t = row[j]; row[j] = row[n - 1 - j]; row[n - 1 - j] = t; }
    }
}
