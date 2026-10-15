class Solution {
    public int numEnclaves(int[][] grid) {
        int m = grid.length, n = grid[0].length;
        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        Deque<int[]> stack = new ArrayDeque<>();
        for (int r = 0; r < m; r++) {
            for (int c = 0; c < n; c++) {
                if (grid[r][c] == 1 && (r == 0 || r == m - 1 || c == 0 || c == n - 1)) {
                    grid[r][c] = 0;
                    stack.push(new int[] {r, c});
                }
            }
        }
        while (!stack.isEmpty()) {
            int[] cell = stack.pop();
            int y = cell[0], x = cell[1];
            for (int[] d : dirs) {
                int ny = y + d[0], nx = x + d[1];
                if (ny >= 0 && ny < m && nx >= 0 && nx < n && grid[ny][nx] == 1) {
                    grid[ny][nx] = 0;
                    stack.push(new int[] {ny, nx});
                }
            }
        }
        int res = 0;
        for (int[] row : grid) {
            for (int value : row) {
                res += value;
            }
        }
        return res;
    }
}
