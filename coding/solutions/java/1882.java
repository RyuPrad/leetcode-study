class Solution {
    public int[] assignTasks(int[] servers, int[] tasks) {
        PriorityQueue<long[]> free = new PriorityQueue<>((a, b) -> a[0] != b[0] ? Long.compare(a[0], b[0]) : Long.compare(a[1], b[1]));
        PriorityQueue<long[]> busy = new PriorityQueue<>((a, b) -> Long.compare(a[0], b[0]));
        for (int i = 0; i < servers.length; i++) {
            free.add(new long[] {servers[i], i});
        }
        int[] res = new int[tasks.length];
        long time = 0;
        for (int j = 0; j < tasks.length; j++) {
            time = Math.max(time, j);
            if (free.isEmpty()) {
                time = busy.peek()[0];
            }
            while (!busy.isEmpty() && busy.peek()[0] <= time) {
                long[] done = busy.poll();
                free.add(new long[] {done[1], done[2]});
            }
            long[] server = free.poll();
            res[j] = (int) server[1];
            busy.add(new long[] {time + tasks[j], server[0], server[1]});
        }
        return res;
    }
}
