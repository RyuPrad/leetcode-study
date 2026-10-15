class Solution {
    public int minimumDifference(int[] nums, int k) {
        Arrays.sort(nums);
        int res = Integer.MAX_VALUE;
        for (int left = 0; left + k - 1 < nums.length; left++) {
            int right = left + k - 1;
            res = Math.min(res, nums[right] - nums[left]);
        }
        return res;
    }
}
