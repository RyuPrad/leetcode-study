class Solution {
    public int minimizeMax(int[] nums, int p) {
        Arrays.sort(nums);
        int left = 0, right = nums[nums.length - 1] - nums[0];
        while (left < right) {
            int mid = left + (right - left) / 2;
            int pairs = 0;
            for (int i = 0; i + 1 < nums.length; i++) {
                if (nums[i + 1] - nums[i] <= mid) {
                    pairs++;
                    i++;
                }
            }
            if (pairs >= p) {
                right = mid;
            } else {
                left = mid + 1;
            }
        }
        return left;
    }
}
