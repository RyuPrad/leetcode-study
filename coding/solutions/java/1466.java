class Solution {
    public int minReorder(int n, int[][] connections) {
        List<List<int[]>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            adj.add(new ArrayList<>());
        }
        for (int[] road : connections) {
            adj.get(road[0]).add(new int[] {road[1], 1});
            adj.get(road[1]).add(new int[] {road[0], 0});
        }
        boolean[] visited = new boolean[n];
        visited[0] = true;
        Deque<Integer> stack = new ArrayDeque<>();
        stack.push(0);
        int res = 0;
        while (!stack.isEmpty()) {
            int node = stack.pop();
            for (int[] edge : adj.get(node)) {
                if (!visited[edge[0]]) {
                    visited[edge[0]] = true;
                    res += edge[1];
                    stack.push(edge[0]);
                }
            }
        }
        return res;
    }
}
