class Solution {
    public int mostBooked(int n, int[][] meetings) {
        Arrays.sort(meetings, (a, b) -> Integer.compare(a[0], b[0]));
        int[] count = new int[n];
        PriorityQueue<Integer> available = new PriorityQueue<>();
        for (int r = 0; r < n; r++) available.add(r);
        // Busy rooms by the time they free up, then by room number.
        PriorityQueue<long[]> busy = new PriorityQueue<>((a, b) -> a[0] != b[0] ? Long.compare(a[0], b[0]) : Long.compare(a[1], b[1]));
        for (int[] m : meetings) {
            int start = m[0], end = m[1];
            while (!busy.isEmpty() && busy.peek()[0] <= start) {
                available.add((int) busy.poll()[1]);
            }
            if (!available.isEmpty()) {
                int room = available.poll();
                count[room]++;
                busy.add(new long[] { end, room });
            } else {
                long[] next = busy.poll();
                count[(int) next[1]]++;
                busy.add(new long[] { next[0] + (end - start), next[1] });
            }
        }
        int best = 0;
        for (int r = 1; r < n; r++) {
            if (count[r] > count[best]) best = r;
        }
        return best;
    }
}
