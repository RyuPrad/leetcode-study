class Solution {
    public int leastInterval(char[] tasks, int n) {
        int[] freq = new int[26];
        for (char t : tasks) freq[t - 'A']++;
        PriorityQueue<Integer> heap = new PriorityQueue<>(Collections.reverseOrder());
        for (int count : freq) if (count > 0) heap.add(count);
        int time = 0;
        Deque<int[]> queue = new ArrayDeque<>(); // [count, time it can run again]
        while (!heap.isEmpty() || !queue.isEmpty()) {
            time++;
            if (!heap.isEmpty()) {
                int cnt = heap.poll() - 1;
                if (cnt > 0) queue.add(new int[] { cnt, time + n });
            }
            if (!queue.isEmpty() && queue.peek()[1] == time) {
                heap.add(queue.poll()[0]);
            }
        }
        return time;
    }
}
