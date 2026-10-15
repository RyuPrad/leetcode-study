class Solution {
    public List<Integer> findSmallestSetOfVertices(int n, List<List<Integer>> edges) {
        boolean[] hasIncoming = new boolean[n];
        for (List<Integer> edge : edges) {
            hasIncoming[edge.get(1)] = true;
        }
        List<Integer> res = new ArrayList<>();
        for (int node = 0; node < n; node++) {
            if (!hasIncoming[node]) {
                res.add(node);
            }
        }
        return res;
    }
}
