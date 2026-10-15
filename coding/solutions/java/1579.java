class Solution {
    private int find(int[] parent, int x) {
        return parent[x] == x ? x : (parent[x] = find(parent, parent[x]));
    }

    private boolean union(int[] parent, int a, int b) {
        int ra = find(parent, a), rb = find(parent, b);
        if (ra == rb) {
            return false;
        }
        parent[ra] = rb;
        return true;
    }

    public int maxNumEdgesToRemove(int n, int[][] edges) {
        int[] alice = new int[n + 1];
        int[] bob = new int[n + 1];
        for (int i = 0; i <= n; i++) {
            alice[i] = i;
            bob[i] = i;
        }
        int used = 0, aliceParts = n, bobParts = n;
        Arrays.sort(edges, (x, y) -> y[0] - x[0]);
        for (int[] edge : edges) {
            int type = edge[0], a = edge[1], b = edge[2];
            boolean useful = false;
            if (type != 2 && union(alice, a, b)) {
                aliceParts--;
                useful = true;
            }
            if (type != 1 && union(bob, a, b)) {
                bobParts--;
                useful = true;
            }
            if (useful) {
                used++;
            }
        }
        return aliceParts == 1 && bobParts == 1 ? edges.length - used : -1;
    }
}
