class Solution {
    public int maximumDetonation(int[][] bombs) {
        int n = bombs.length;
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            adj.add(new ArrayList<>());
        }
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                long dx = bombs[i][0] - bombs[j][0], dy = bombs[i][1] - bombs[j][1];
                long r = bombs[i][2];
                if (i != j && dx * dx + dy * dy <= r * r) {
                    adj.get(i).add(j);
                }
            }
        }
        int res = 0;
        for (int start = 0; start < n; start++) {
            boolean[] visited = new boolean[n];
            visited[start] = true;
            int count = 1;
            Deque<Integer> stack = new ArrayDeque<>();
            stack.push(start);
            while (!stack.isEmpty()) {
                int bomb = stack.pop();
                for (int next : adj.get(bomb)) {
                    if (!visited[next]) {
                        visited[next] = true;
                        count++;
                        stack.push(next);
                    }
                }
            }
            res = Math.max(res, count);
        }
        return res;
    }
}
