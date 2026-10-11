class Solution {
    public boolean carPooling(int[][] trips, int capacity) {
        Arrays.sort(trips, (a, b) -> Integer.compare(a[1], b[1]));
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0]) : Integer.compare(a[1], b[1]));
        int cur = 0;
        for (int[] trip : trips) {
            int num = trip[0], start = trip[1], end = trip[2];
            while (!heap.isEmpty() && heap.peek()[0] <= start) {
                cur -= heap.poll()[1];
            }
            cur += num;
            if (cur > capacity) return false;
            heap.add(new int[] { end, num });
        }
        return true;
    }
}
