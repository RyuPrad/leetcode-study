class Solution {
    public int maxPoints(int[][] points) {
        int res = 1;
        for (int i = 0; i < points.length; i++) {
            Map<Double, Integer> count = new HashMap<>();
            for (int j = i + 1; j < points.length; j++) {
                int dx = points[j][0] - points[i][0], dy = points[j][1] - points[i][1];
                double slope = dx == 0 ? Double.POSITIVE_INFINITY : dy == 0 ? 0.0 : (double) dy / dx;
                count.put(slope, count.getOrDefault(slope, 1) + 1);
                res = Math.max(res, count.get(slope));
            }
        }
        return res;
    }
}
