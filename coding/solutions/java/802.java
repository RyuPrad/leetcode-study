class Solution {
    public List<Integer> eventualSafeNodes(int[][] graph) {
        int n = graph.length;
        List<List<Integer>> reverse = new ArrayList<>();
        for (int node = 0; node < n; node++) {
            reverse.add(new ArrayList<>());
        }
        int[] outDegree = new int[n];
        for (int node = 0; node < n; node++) {
            outDegree[node] = graph[node].length;
            for (int next : graph[node]) {
                reverse.get(next).add(node);
            }
        }
        List<Integer> queue = new ArrayList<>();
        for (int node = 0; node < n; node++) {
            if (outDegree[node] == 0) {
                queue.add(node);
            }
        }
        boolean[] safe = new boolean[n];
        for (int head = 0; head < queue.size(); head++) {
            int node = queue.get(head);
            safe[node] = true;
            for (int prev : reverse.get(node)) {
                outDegree[prev]--;
                if (outDegree[prev] == 0) {
                    queue.add(prev);
                }
            }
        }
        List<Integer> res = new ArrayList<>();
        for (int node = 0; node < n; node++) {
            if (safe[node]) {
                res.add(node);
            }
        }
        return res;
    }
}
