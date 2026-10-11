class Solution {
    public int maxProduct(int[] nums) {
        int res = nums[0];
        int curMax = nums[0];
        int curMin = nums[0];
        for (int i = 1; i < nums.length; i++) {
            int n = nums[i];
            int tmpMax = Math.max(n, Math.max(curMax * n, curMin * n));
            curMin = Math.min(n, Math.min(curMax * n, curMin * n));
            curMax = tmpMax;
            res = Math.max(res, curMax);
        }
        return res;
    }
}
