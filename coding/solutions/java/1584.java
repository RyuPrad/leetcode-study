class Solution {
    public int minCostConnectPoints(int[][] points) {
        int n = points.length;
        boolean[] inMST = new boolean[n];
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
        heap.add(new int[] { 0, 0 });
        int total = 0, count = 0;
        while (!heap.isEmpty() && count < n) {
            int[] top = heap.poll();
            int cost = top[0], i = top[1];
            if (inMST[i]) continue;
            inMST[i] = true;
            total += cost;
            count++;
            for (int j = 0; j < n; j++) {
                if (!inMST[j]) {
                    int d = Math.abs(points[i][0] - points[j][0]) + Math.abs(points[i][1] - points[j][1]);
                    heap.add(new int[] { d, j });
                }
            }
        }
        return total;
    }
}
