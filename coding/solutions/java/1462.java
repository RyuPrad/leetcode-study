class Solution {
    private List<List<Integer>> adj;
    private boolean[][] reach;

    public List<Boolean> checkIfPrerequisite(int numCourses, int[][] prerequisites, int[][] queries) {
        adj = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
        for (int[] p : prerequisites) adj.get(p[0]).add(p[1]);
        reach = new boolean[numCourses][numCourses];
        for (int i = 0; i < numCourses; i++) dfs(i, i);
        List<Boolean> res = new ArrayList<>();
        for (int[] q : queries) res.add(reach[q[0]][q[1]]);
        return res;
    }

    private void dfs(int src, int node) {
        for (int nei : adj.get(node)) {
            if (!reach[src][nei]) {
                reach[src][nei] = true;
                dfs(src, nei);
            }
        }
    }
}
