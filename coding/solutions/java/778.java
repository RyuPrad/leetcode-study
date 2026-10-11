class Solution {
    public int swimInWater(int[][] grid) {
        int n = grid.length;
        int[][] time = new int[n][n];
        for (int[] row : time) Arrays.fill(row, Integer.MAX_VALUE);
        time[0][0] = grid[0][0];
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
        heap.add(new int[] { grid[0][0], 0, 0 });
        int[][] dirs = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
        while (!heap.isEmpty()) {
            int[] top = heap.poll();
            int t = top[0], r = top[1], c = top[2];
            if (r == n - 1 && c == n - 1) return t;
            if (t > time[r][c]) continue;
            for (int[] dir : dirs) {
                int nr = r + dir[0], nc = c + dir[1];
                if (nr >= 0 && nr < n && nc >= 0 && nc < n) {
                    int nt = Math.max(t, grid[nr][nc]);
                    if (nt < time[nr][nc]) { time[nr][nc] = nt; heap.add(new int[] { nt, nr, nc }); }
                }
            }
        }
        return -1;
    }
}
