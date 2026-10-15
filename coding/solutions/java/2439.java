class Solution {
    public int minimizeArrayValue(int[] nums) {
        long prefix = 0, res = 0;
        for (int i = 0; i < nums.length; i++) {
            prefix += nums[i];
            res = Math.max(res, (prefix + i) / (i + 1));
        }
        return (int) res;
    }
}
