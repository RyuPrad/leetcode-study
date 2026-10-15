class Solution {
    public double maxProbability(int n, int[][] edges, double[] succProb, int start_node, int end_node) {
        List<List<double[]>> adj = new ArrayList<>();
        for (int v = 0; v < n; v++) {
            adj.add(new ArrayList<>());
        }
        for (int i = 0; i < edges.length; i++) {
            int a = edges[i][0], b = edges[i][1];
            adj.get(a).add(new double[] {b, succProb[i]});
            adj.get(b).add(new double[] {a, succProb[i]});
        }
        double[] best = new double[n];
        best[start_node] = 1;
        PriorityQueue<double[]> heap = new PriorityQueue<>((x, y) -> Double.compare(y[0], x[0]));
        heap.add(new double[] {1, start_node});
        while (!heap.isEmpty()) {
            double[] top = heap.poll();
            double prob = top[0];
            int node = (int) top[1];
            if (node == end_node) {
                return prob;
            }
            if (prob < best[node]) {
                continue;
            }
            for (double[] edge : adj.get(node)) {
                int next = (int) edge[0];
                double candidate = prob * edge[1];
                if (candidate > best[next]) {
                    best[next] = candidate;
                    heap.add(new double[] {candidate, next});
                }
            }
        }
        return 0;
    }
}
