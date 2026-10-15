class Solution {
    public int countSubIslands(int[][] grid1, int[][] grid2) {
        int m = grid2.length, n = grid2[0].length;
        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        int res = 0;
        for (int r = 0; r < m; r++) {
            for (int c = 0; c < n; c++) {
                if (grid2[r][c] != 1) {
                    continue;
                }
                boolean sub = true;
                Deque<int[]> stack = new ArrayDeque<>();
                stack.push(new int[] {r, c});
                grid2[r][c] = 0;
                while (!stack.isEmpty()) {
                    int[] cell = stack.pop();
                    int y = cell[0], x = cell[1];
                    if (grid1[y][x] == 0) {
                        sub = false;
                    }
                    for (int[] d : dirs) {
                        int ny = y + d[0], nx = x + d[1];
                        if (ny >= 0 && ny < m && nx >= 0 && nx < n && grid2[ny][nx] == 1) {
                            grid2[ny][nx] = 0;
                            stack.push(new int[] {ny, nx});
                        }
                    }
                }
                if (sub) {
                    res++;
                }
            }
        }
        return res;
    }
}
