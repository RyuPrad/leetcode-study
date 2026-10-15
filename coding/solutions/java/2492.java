class Solution {
    public int minScore(int n, int[][] roads) {
        List<List<int[]>> adj = new ArrayList<>();
        for (int i = 0; i <= n; i++) {
            adj.add(new ArrayList<>());
        }
        for (int[] road : roads) {
            adj.get(road[0]).add(new int[] {road[1], road[2]});
            adj.get(road[1]).add(new int[] {road[0], road[2]});
        }
        boolean[] visited = new boolean[n + 1];
        visited[1] = true;
        Deque<Integer> stack = new ArrayDeque<>();
        stack.push(1);
        int res = Integer.MAX_VALUE;
        while (!stack.isEmpty()) {
            int node = stack.pop();
            for (int[] edge : adj.get(node)) {
                res = Math.min(res, edge[1]);
                if (!visited[edge[0]]) {
                    visited[edge[0]] = true;
                    stack.push(edge[0]);
                }
            }
        }
        return res;
    }
}
