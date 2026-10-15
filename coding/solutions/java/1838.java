class Solution {
    public int maxFrequency(int[] nums, int k) {
        Arrays.sort(nums);
        int left = 0, res = 0;
        long total = 0;
        for (int right = 0; right < nums.length; right++) {
            total += nums[right];
            while ((long) nums[right] * (right - left + 1) > total + k) {
                total -= nums[left];
                left++;
            }
            res = Math.max(res, right - left + 1);
        }
        return res;
    }
}
