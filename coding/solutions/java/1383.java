class Solution {
    public int maxPerformance(int n, int[] speed, int[] efficiency, int k) {
        int[][] engineers = new int[n][];
        for (int i = 0; i < n; i++) {
            engineers[i] = new int[] {efficiency[i], speed[i]};
        }
        Arrays.sort(engineers, (a, b) -> b[0] - a[0]);
        PriorityQueue<Integer> heap = new PriorityQueue<>();
        long sum = 0, best = 0;
        for (int[] engineer : engineers) {
            heap.add(engineer[1]);
            sum += engineer[1];
            if (heap.size() > k) {
                sum -= heap.poll();
            }
            long performance = sum * engineer[0];
            if (performance > best) {
                best = performance;
            }
        }
        return (int) (best % 1000000007);
    }
}
