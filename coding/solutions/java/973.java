class Solution {
    public int[][] kClosest(int[][] points, int k) {
        // Ordered by distance, then x, then y.
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) ->
            a[0] != b[0] ? Integer.compare(a[0], b[0]) : a[1] != b[1] ? Integer.compare(a[1], b[1]) : Integer.compare(a[2], b[2]));
        for (int[] p : points) {
            heap.add(new int[] { p[0] * p[0] + p[1] * p[1], p[0], p[1] });
        }
        int[][] res = new int[k][];
        for (int i = 0; i < k; i++) {
            int[] top = heap.poll();
            res[i] = new int[] { top[1], top[2] };
        }
        return res;
    }
}
