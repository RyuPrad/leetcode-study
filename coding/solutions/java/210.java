class Solution {
    public int[] findOrder(int numCourses, int[][] prerequisites) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
        int[] indegree = new int[numCourses];
        for (int[] edge : prerequisites) {
            int course = edge[0], pre = edge[1];
            adj.get(pre).add(course);
            indegree[course]++;
        }
        Deque<Integer> queue = new ArrayDeque<>();
        for (int i = 0; i < numCourses; i++) {
            if (indegree[i] == 0) queue.add(i);
        }
        int[] order = new int[numCourses];
        int count = 0;
        while (!queue.isEmpty()) {
            int node = queue.poll();
            order[count++] = node;
            for (int next : adj.get(node)) {
                indegree[next]--;
                if (indegree[next] == 0) queue.add(next);
            }
        }
        return count == numCourses ? order : new int[0];
    }
}
