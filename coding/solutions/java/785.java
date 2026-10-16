class Solution {
    public boolean isBipartite(int[][] graph) {
        int n = graph.length;
        int[] color = new int[n];
        int start = 0;
        while (start < n) {
            if (color[start] == 0) {
                color[start] = 1;
                List<Integer> queue = new ArrayList<>(List.of(start));
                int head = 0;
                while (head < queue.size()) {
                    int node = queue.get(head);
                    head++;
                    int i = 0;
                    while (i < graph[node].length) {
                        int neighbor = graph[node][i];
                        if (color[neighbor] == 0) {
                            color[neighbor] = -color[node];
                            queue.add(neighbor);
                        } else if (color[neighbor] == color[node]) {
                            return false;
                        }
                        i++;
                    }
                }
            }
            start++;
        }
        return true;
    }
}
