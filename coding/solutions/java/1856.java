class Solution {
    public int maxSumMinProduct(int[] nums) {
        int n = nums.length;
        long[] prefix = new long[n + 1];
        for (int i = 0; i < n; i++) {
            prefix[i + 1] = prefix[i] + nums[i];
        }
        Deque<int[]> stack = new ArrayDeque<>();
        long res = 0;
        for (int i = 0; i <= n; i++) {
            int value = i < n ? nums[i] : 0;
            int start = i;
            while (!stack.isEmpty() && stack.peek()[1] > value) {
                int[] top = stack.pop();
                long product = (long) top[1] * (prefix[i] - prefix[top[0]]);
                if (product > res) {
                    res = product;
                }
                start = top[0];
            }
            stack.push(new int[] {start, value});
        }
        return (int) (res % 1000000007);
    }
}
