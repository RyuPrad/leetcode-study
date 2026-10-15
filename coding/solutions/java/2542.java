class Solution {
    public long maxScore(int[] nums1, int[] nums2, int k) {
        int n = nums1.length;
        int[][] pairs = new int[n][];
        for (int i = 0; i < n; i++) {
            pairs[i] = new int[] {nums1[i], nums2[i]};
        }
        Arrays.sort(pairs, (x, y) -> y[1] - x[1]);
        PriorityQueue<Integer> heap = new PriorityQueue<>();
        long sum = 0, res = 0;
        for (int[] pair : pairs) {
            heap.add(pair[0]);
            sum += pair[0];
            if (heap.size() > k) {
                sum -= heap.poll();
            }
            if (heap.size() == k) {
                res = Math.max(res, sum * pair[1]);
            }
        }
        return res;
    }
}
