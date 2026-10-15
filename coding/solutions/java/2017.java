class Solution {
    public long gridGame(int[][] grid) {
        int n = grid[0].length;
        long top = 0, bottom = 0, res = Long.MAX_VALUE;
        for (int value : grid[0]) top += value;
        for (int i = 0; i < n; i++) {
            top -= grid[0][i];
            res = Math.min(res, Math.max(top, bottom));
            bottom += grid[1][i];
        }
        return res;
    }
}
