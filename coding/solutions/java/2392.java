class Solution {
    public int[][] buildMatrix(int k, int[][] rowConditions, int[][] colConditions) {
        int[] rowOrder = topo(k, rowConditions);
        int[] colOrder = topo(k, colConditions);
        if (rowOrder == null || colOrder == null) return new int[0][];
        int[] rowPos = new int[k + 1], colPos = new int[k + 1];
        for (int i = 0; i < k; i++) { rowPos[rowOrder[i]] = i; colPos[colOrder[i]] = i; }
        int[][] matrix = new int[k][k];
        for (int v = 1; v <= k; v++) matrix[rowPos[v]][colPos[v]] = v;
        return matrix;
    }

    private int[] topo(int k, int[][] conditions) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i <= k; i++) adj.add(new ArrayList<>());
        int[] indeg = new int[k + 1];
        for (int[] c : conditions) { adj.get(c[0]).add(c[1]); indeg[c[1]]++; }
        int[] queue = new int[k];
        int head = 0, tail = 0;
        for (int i = 1; i <= k; i++) if (indeg[i] == 0) queue[tail++] = i;
        while (head < tail) {
            int node = queue[head++];
            for (int nei : adj.get(node)) { if (--indeg[nei] == 0) queue[tail++] = nei; }
        }
        return tail == k ? queue : null;
    }
}
