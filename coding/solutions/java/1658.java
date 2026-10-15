class Solution {
    public int minOperations(int[] nums, int x) {
        int target = Arrays.stream(nums).sum() - x;
        int left = 0, sum = 0, best = -1;
        for (int right = 0; right < nums.length; right++) {
            sum += nums[right];
            while (left <= right && sum > target) {
                sum -= nums[left];
                left++;
            }
            if (sum == target) {
                best = Math.max(best, right - left + 1);
            }
        }
        return best == -1 ? -1 : nums.length - best;
    }
}
