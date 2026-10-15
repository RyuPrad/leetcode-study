class Solution {
    public int minimumDeviation(int[] nums) {
        PriorityQueue<Integer> heap = new PriorityQueue<>(Collections.reverseOrder());
        int low = Integer.MAX_VALUE;
        for (int num : nums) {
            int value = num % 2 == 1 ? num * 2 : num;
            heap.add(value);
            low = Math.min(low, value);
        }
        int res = Integer.MAX_VALUE;
        while (true) {
            int high = heap.poll();
            res = Math.min(res, high - low);
            if (high % 2 == 1) {
                break;
            }
            heap.add(high / 2);
            low = Math.min(low, high / 2);
        }
        return res;
    }
}
