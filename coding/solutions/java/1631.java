class Solution {
    public int minimumEffortPath(int[][] heights) {
        int rows = heights.length, cols = heights[0].length;
        int[][] effort = new int[rows][cols];
        for (int[] row : effort) Arrays.fill(row, Integer.MAX_VALUE);
        effort[0][0] = 0;
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
        heap.add(new int[] { 0, 0, 0 });
        int[][] dirs = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
        while (!heap.isEmpty()) {
            int[] top = heap.poll();
            int e = top[0], r = top[1], c = top[2];
            if (r == rows - 1 && c == cols - 1) return e;
            if (e > effort[r][c]) continue;
            for (int[] dir : dirs) {
                int nr = r + dir[0], nc = c + dir[1];
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                    int ne = Math.max(e, Math.abs(heights[nr][nc] - heights[r][c]));
                    if (ne < effort[nr][nc]) { effort[nr][nc] = ne; heap.add(new int[] { ne, nr, nc }); }
                }
            }
        }
        return 0;
    }
}
