class Solution {
    public int minTime(int n, int[][] edges, List<Boolean> hasApple) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            adj.add(new ArrayList<>());
        }
        for (int[] edge : edges) {
            adj.get(edge[0]).add(edge[1]);
            adj.get(edge[1]).add(edge[0]);
        }
        int[] parent = new int[n];
        Arrays.fill(parent, -1);
        parent[0] = 0;
        int[] order = new int[n];
        int size = 0;
        order[size++] = 0;
        for (int i = 0; i < size; i++) {
            for (int next : adj.get(order[i])) {
                if (parent[next] == -1) {
                    parent[next] = order[i];
                    order[size++] = next;
                }
            }
        }
        boolean[] need = new boolean[n];
        for (int v = 0; v < n; v++) {
            need[v] = hasApple.get(v);
        }
        int res = 0;
        for (int i = n - 1; i > 0; i--) {
            int node = order[i];
            if (need[node]) {
                res += 2;
                need[parent[node]] = true;
            }
        }
        return res;
    }
}
