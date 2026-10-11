class Solution {
    public int[] minInterval(int[][] intervals, int[] queries) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        Integer[] order = new Integer[queries.length];
        for (int i = 0; i < order.length; i++) order[i] = i;
        Arrays.sort(order, (a, b) -> Integer.compare(queries[a], queries[b]));
        int[] res = new int[queries.length];
        // Smallest interval size first; entries are [size, right end].
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
        int i = 0;
        for (int idx : order) {
            int q = queries[idx];
            while (i < intervals.length && intervals[i][0] <= q) {
                int l = intervals[i][0], r = intervals[i][1];
                heap.add(new int[] { r - l + 1, r });
                i++;
            }
            while (!heap.isEmpty() && heap.peek()[1] < q) {
                heap.poll();
            }
            res[idx] = heap.isEmpty() ? -1 : heap.peek()[0];
        }
        return res;
    }
}
