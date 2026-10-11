class Solution {
    public int[] maxSlidingWindow(int[] nums, int k) {
        int[] res = new int[nums.length - k + 1];
        Deque<Integer> deque = new ArrayDeque<>();
        for (int right = 0; right < nums.length; right++) {
            while (!deque.isEmpty() && nums[deque.peekLast()] < nums[right]) {
                deque.pollLast();
            }
            deque.addLast(right);
            if (deque.peekFirst() <= right - k) {
                deque.pollFirst();
            }
            if (right >= k - 1) {
                res[right - k + 1] = nums[deque.peekFirst()];
            }
        }
        return res;
    }
}
