class Solution {
    public int maxDistance(int[][] grid) {
        int n = grid.length;
        int[][] dist = new int[n][n];
        List<int[]> queue = new ArrayList<>();
        for (int r = 0; r < n; r++) {
            for (int c = 0; c < n; c++) {
                dist[r][c] = grid[r][c] == 1 ? 0 : -1;
                if (grid[r][c] == 1) {
                    queue.add(new int[] {r, c});
                }
            }
        }
        if (queue.isEmpty() || queue.size() == n * n) {
            return -1;
        }
        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        int res = 0;
        for (int head = 0; head < queue.size(); head++) {
            int r = queue.get(head)[0], c = queue.get(head)[1];
            for (int[] d : dirs) {
                int nr = r + d[0], nc = c + d[1];
                if (nr >= 0 && nr < n && nc >= 0 && nc < n && dist[nr][nc] == -1) {
                    dist[nr][nc] = dist[r][c] + 1;
                    res = Math.max(res, dist[nr][nc]);
                    queue.add(new int[] {nr, nc});
                }
            }
        }
        return res;
    }
}
