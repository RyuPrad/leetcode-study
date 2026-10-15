class Solution {
    public int largestPathValue(String colors, int[][] edges) {
        int n = colors.length();
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            adj.add(new ArrayList<>());
        }
        int[] indegree = new int[n];
        for (int[] edge : edges) {
            adj.get(edge[0]).add(edge[1]);
            indegree[edge[1]]++;
        }
        int[][] count = new int[n][26];
        int[] queue = new int[n];
        int size = 0;
        for (int node = 0; node < n; node++) {
            if (indegree[node] == 0) {
                queue[size++] = node;
            }
        }
        int res = 0;
        for (int head = 0; head < size; head++) {
            int node = queue[head];
            int own = colors.charAt(node) - 'a';
            count[node][own]++;
            res = Math.max(res, count[node][own]);
            for (int next : adj.get(node)) {
                for (int k = 0; k < 26; k++) {
                    count[next][k] = Math.max(count[next][k], count[node][k]);
                }
                indegree[next]--;
                if (indegree[next] == 0) {
                    queue[size++] = next;
                }
            }
        }
        return size == n ? res : -1;
    }
}
