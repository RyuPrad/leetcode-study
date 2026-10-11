class Solution {
    public int networkDelayTime(int[][] times, int n, int k) {
        List<List<int[]>> adj = new ArrayList<>();
        for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
        for (int[] t : times) adj.get(t[0]).add(new int[] { t[1], t[2] });
        int[] dist = new int[n + 1];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[k] = 0;
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
        heap.add(new int[] { 0, k });
        while (!heap.isEmpty()) {
            int[] top = heap.poll();
            int d = top[0], node = top[1];
            if (d > dist[node]) continue;
            for (int[] edge : adj.get(node)) {
                int nei = edge[0], w = edge[1];
                if (d + w < dist[nei]) {
                    dist[nei] = d + w;
                    heap.add(new int[] { dist[nei], nei });
                }
            }
        }
        int ans = 0;
        for (int i = 1; i <= n; i++) {
            if (dist[i] == Integer.MAX_VALUE) return -1;
            ans = Math.max(ans, dist[i]);
        }
        return ans;
    }
}
