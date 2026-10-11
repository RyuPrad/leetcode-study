class MinHeap {
    private final List<int[]> heap = new ArrayList<>();
    int size() { return heap.size(); }
    void push(int[] item) {
        List<int[]> h = heap;
        h.add(item);
        int i = h.size() - 1;
        while (i > 0) {
            int p = (i - 1) >> 1;
            if (h.get(p)[0] <= h.get(i)[0]) break;
            Collections.swap(h, p, i);
            i = p;
        }
    }
    int[] pop() {
        List<int[]> h = heap;
        int[] top = h.get(0);
        int[] last = h.remove(h.size() - 1);
        if (h.size() > 0) {
            h.set(0, last);
            int i = 0;
            while (true) {
                int l = 2 * i + 1, r = 2 * i + 2, s = i;
                if (l < h.size() && h.get(l)[0] < h.get(s)[0]) s = l;
                if (r < h.size() && h.get(r)[0] < h.get(s)[0]) s = r;
                if (s == i) break;
                Collections.swap(h, s, i);
                i = s;
            }
        }
        return top;
    }
}
class Solution {
    public int swimInWater(int[][] grid) {
        int n = grid.length;
        int[][] time = new int[n][n]; for (int[] row : time) Arrays.fill(row, Integer.MAX_VALUE);
        time[0][0] = grid[0][0];
        MinHeap heap = new MinHeap();
        heap.push(new int[] { grid[0][0], 0, 0 });
        int[][] dirs = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
        while (heap.size() > 0) {
            int[] top = heap.pop(); int t = top[0], r = top[1], c = top[2];
            if (r == n - 1 && c == n - 1) return t;
            if (t > time[r][c]) continue;
            for (int[] dir : dirs) {
                int nr = r + dir[0], nc = c + dir[1];
                if (nr >= 0 && nr < n && nc >= 0 && nc < n) {
                    int nt = Math.max(t, grid[nr][nc]);
                    if (nt < time[nr][nc]) { time[nr][nc] = nt; heap.push(new int[] { nt, nr, nc }); }
                }
            }
        }
        return -1;
    }
}
