class Solution {
    public int shortestBridge(int[][] grid) {
        int n = grid.length;
        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        int[] start = null;
        for (int r = 0; r < n && start == null; r++) {
            for (int c = 0; c < n && start == null; c++) {
                if (grid[r][c] == 1) {
                    start = new int[] {r, c};
                }
            }
        }
        List<int[]> queue = new ArrayList<>();
        Deque<int[]> stack = new ArrayDeque<>();
        stack.push(start);
        grid[start[0]][start[1]] = 2;
        while (!stack.isEmpty()) {
            int[] cell = stack.pop();
            queue.add(cell);
            for (int[] d : dirs) {
                int ny = cell[0] + d[0], nx = cell[1] + d[1];
                if (ny >= 0 && ny < n && nx >= 0 && nx < n && grid[ny][nx] == 1) {
                    grid[ny][nx] = 2;
                    stack.push(new int[] {ny, nx});
                }
            }
        }
        int distance = 0;
        while (!queue.isEmpty()) {
            List<int[]> next = new ArrayList<>();
            for (int[] cell : queue) {
                for (int[] d : dirs) {
                    int ny = cell[0] + d[0], nx = cell[1] + d[1];
                    if (ny < 0 || ny >= n || nx < 0 || nx >= n || grid[ny][nx] == 2) {
                        continue;
                    }
                    if (grid[ny][nx] == 1) {
                        return distance;
                    }
                    grid[ny][nx] = 2;
                    next.add(new int[] {ny, nx});
                }
            }
            queue = next;
            distance++;
        }
        return -1;
    }
}
