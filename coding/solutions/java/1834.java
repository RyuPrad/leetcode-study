class Solution {
    public int[] getOrder(int[][] tasks) {
        int n = tasks.length;
        int[][] indexed = new int[n][];
        for (int i = 0; i < n; i++) indexed[i] = new int[] { tasks[i][0], tasks[i][1], i };
        Arrays.sort(indexed, (a, b) -> Integer.compare(a[0], b[0]));
        // Shortest processing time first, then lowest index.
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0]) : Integer.compare(a[1], b[1]));
        int[] res = new int[n];
        int count = 0, i = 0;
        long time = 0;
        while (count < n) {
            while (i < n && indexed[i][0] <= time) {
                heap.add(new int[] { indexed[i][1], indexed[i][2] });
                i++;
            }
            if (heap.isEmpty()) {
                time = indexed[i][0];
                continue;
            }
            int[] next = heap.poll();
            time += next[0];
            res[count++] = next[1];
        }
        return res;
    }
}
