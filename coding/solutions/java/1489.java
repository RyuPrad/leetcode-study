class Solution {
    private int[] parent;
    private int count;
    private int[][] indexed;
    private int n;

    public List<List<Integer>> findCriticalAndPseudoCriticalEdges(int n, int[][] edges) {
        this.n = n;
        indexed = new int[edges.length][];
        for (int i = 0; i < edges.length; i++) indexed[i] = new int[] { edges[i][0], edges[i][1], edges[i][2], i };
        Arrays.sort(indexed, (a, b) -> Integer.compare(a[2], b[2]));
        int mstWeight = buildMST(-1, -1);
        List<Integer> critical = new ArrayList<>(), pseudo = new ArrayList<>();
        for (int i = 0; i < indexed.length; i++) {
            if (buildMST(i, -1) > mstWeight) critical.add(indexed[i][3]);
            else if (buildMST(-1, i) == mstWeight) pseudo.add(indexed[i][3]);
        }
        return List.of(critical, pseudo);
    }

    private int buildMST(int skip, int force) {
        parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
        count = n;
        int weight = 0;
        if (force != -1) { union(indexed[force][0], indexed[force][1]); weight += indexed[force][2]; }
        for (int i = 0; i < indexed.length; i++) {
            if (i == skip) continue;
            if (union(indexed[i][0], indexed[i][1])) weight += indexed[i][2];
        }
        return count == 1 ? weight : Integer.MAX_VALUE;
    }

    private int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }

    private boolean union(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return false;
        parent[ra] = rb;
        count--;
        return true;
    }
}
