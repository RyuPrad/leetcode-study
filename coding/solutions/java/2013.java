class DetectSquares {
    private final int[][] counts = new int[1001][1001];
    private final List<int[]> points = new ArrayList<>();

    public DetectSquares() {
    }

    public void add(int[] point) {
        if (counts[point[0]][point[1]]++ == 0) points.add(point);
    }

    public int count(int[] point) {
        int x = point[0], y = point[1];
        int res = 0;
        for (int[] p : points) {
            int px = p[0], py = p[1];
            if (Math.abs(px - x) == Math.abs(py - y) && px != x && py != y) {
                res += counts[px][py] * counts[x][py] * counts[px][y];
            }
        }
        return res;
    }
}
