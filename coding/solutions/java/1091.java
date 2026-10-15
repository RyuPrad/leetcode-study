class Solution {
    public int shortestPathBinaryMatrix(int[][] grid) {
        int n = grid.length;
        if (grid[0][0] == 1 || grid[n - 1][n - 1] == 1) {
            return -1;
        }
        int[][] dist = new int[n][n];
        dist[0][0] = 1;
        List<int[]> queue = new ArrayList<>();
        queue.add(new int[] {0, 0});
        for (int head = 0; head < queue.size(); head++) {
            int r = queue.get(head)[0], c = queue.get(head)[1];
            if (r == n - 1 && c == n - 1) {
                return dist[r][c];
            }
            for (int dr = -1; dr <= 1; dr++) {
                for (int dc = -1; dc <= 1; dc++) {
                    int nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] == 0 && dist[nr][nc] == 0) {
                        dist[nr][nc] = dist[r][c] + 1;
                        queue.add(new int[] {nr, nc});
                    }
                }
            }
        }
        return -1;
    }
}
