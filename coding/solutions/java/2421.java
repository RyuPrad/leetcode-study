class Solution {
    private int[] parent;

    private int find(int x) {
        return parent[x] == x ? x : (parent[x] = find(parent[x]));
    }

    public int numberOfGoodPaths(int[] vals, int[][] edges) {
        int n = vals.length;
        parent = new int[n];
        for (int v = 0; v < n; v++) {
            parent[v] = v;
        }
        List<List<Integer>> adj = new ArrayList<>();
        for (int v = 0; v < n; v++) {
            adj.add(new ArrayList<>());
        }
        for (int[] edge : edges) {
            adj.get(edge[0]).add(edge[1]);
            adj.get(edge[1]).add(edge[0]);
        }
        Integer[] order = new Integer[n];
        for (int v = 0; v < n; v++) {
            order[v] = v;
        }
        Arrays.sort(order, (a, b) -> vals[a] - vals[b]);
        int res = 0, i = 0;
        while (i < n) {
            int j = i;
            while (j < n && vals[order[j]] == vals[order[i]]) {
                for (int next : adj.get(order[j])) {
                    if (vals[next] <= vals[order[j]]) {
                        parent[find(next)] = find(order[j]);
                    }
                }
                j++;
            }
            Map<Integer, Integer> count = new HashMap<>();
            for (int k = i; k < j; k++) {
                int root = find(order[k]);
                count.put(root, count.getOrDefault(root, 0) + 1);
            }
            for (int c : count.values()) {
                res += c * (c + 1) / 2;
            }
            i = j;
        }
        return res;
    }
}
