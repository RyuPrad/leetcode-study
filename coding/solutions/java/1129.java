class Solution {
    public int[] shortestAlternatingPaths(int n, int[][] redEdges, int[][] blueEdges) {
        List<List<int[]>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            adj.add(new ArrayList<>());
        }
        for (int[] e : redEdges) {
            adj.get(e[0]).add(new int[] {e[1], 0});
        }
        for (int[] e : blueEdges) {
            adj.get(e[0]).add(new int[] {e[1], 1});
        }
        int[] res = new int[n];
        Arrays.fill(res, -1);
        boolean[][] seen = new boolean[n][2];
        List<int[]> queue = new ArrayList<>();
        queue.add(new int[] {0, -1, 0});
        res[0] = 0;
        for (int head = 0; head < queue.size(); head++) {
            int[] state = queue.get(head);
            int node = state[0], color = state[1], length = state[2];
            for (int[] edge : adj.get(node)) {
                int next = edge[0], edgeColor = edge[1];
                if (edgeColor != color && !seen[next][edgeColor]) {
                    seen[next][edgeColor] = true;
                    if (res[next] == -1) {
                        res[next] = length + 1;
                    }
                    queue.add(new int[] {next, edgeColor, length + 1});
                }
            }
        }
        return res;
    }
}
