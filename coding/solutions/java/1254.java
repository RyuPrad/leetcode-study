class Solution {
    public int closedIsland(int[][] grid) {
        int m = grid.length, n = grid[0].length;
        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        int res = 0;
        for (int r = 0; r < m; r++) {
            for (int c = 0; c < n; c++) {
                if (grid[r][c] != 0) {
                    continue;
                }
                boolean closed = true;
                Deque<int[]> stack = new ArrayDeque<>();
                stack.push(new int[] {r, c});
                grid[r][c] = 1;
                while (!stack.isEmpty()) {
                    int[] cell = stack.pop();
                    int y = cell[0], x = cell[1];
                    if (y == 0 || y == m - 1 || x == 0 || x == n - 1) {
                        closed = false;
                    }
                    for (int[] d : dirs) {
                        int ny = y + d[0], nx = x + d[1];
                        if (ny >= 0 && ny < m && nx >= 0 && nx < n && grid[ny][nx] == 0) {
                            grid[ny][nx] = 1;
                            stack.push(new int[] {ny, nx});
                        }
                    }
                }
                if (closed) {
                    res++;
                }
            }
        }
        return res;
    }
}
