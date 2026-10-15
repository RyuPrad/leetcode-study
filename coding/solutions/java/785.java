class Solution {
    public boolean isBipartite(int[][] graph) {
        int n = graph.length;
        int[] color = new int[n];
        Arrays.fill(color, -1);
        for (int start = 0; start < n; start++) {
            if (color[start] != -1) {
                continue;
            }
            color[start] = 0;
            List<Integer> queue = new ArrayList<>();
            queue.add(start);
            for (int head = 0; head < queue.size(); head++) {
                int node = queue.get(head);
                for (int next : graph[node]) {
                    if (color[next] == -1) {
                        color[next] = 1 - color[node];
                        queue.add(next);
                    } else if (color[next] == color[node]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
}
