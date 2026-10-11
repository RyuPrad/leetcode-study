class Solution {
    private int ans = 0;

    public int subsetXORSum(int[] nums) {
        dfs(nums, 0, 0);
        return ans;
    }

    private void dfs(int[] nums, int i, int xorSoFar) {
        if (i == nums.length) {
            ans += xorSoFar;
            return;
        }
        dfs(nums, i + 1, xorSoFar ^ nums[i]);
        dfs(nums, i + 1, xorSoFar);
    }
}
