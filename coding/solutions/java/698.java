class Solution {
    private int[] nums;
    private boolean[] used;
    private int target;

    public boolean canPartitionKSubsets(int[] nums, int k) {
        int total = Arrays.stream(nums).sum();
        if (total % k != 0) return false;
        target = total / k;
        this.nums = Arrays.stream(nums).boxed().sorted(Collections.reverseOrder()).mapToInt(Integer::intValue).toArray();
        if (this.nums[0] > target) return false;
        used = new boolean[nums.length];
        return dfs(0, k, 0);
    }

    private boolean dfs(int start, int k, int curSum) {
        if (k == 0) return true;
        if (curSum == target) return dfs(0, k - 1, 0);
        for (int i = start; i < nums.length; i++) {
            if (used[i] || curSum + nums[i] > target) continue;
            used[i] = true;
            if (dfs(i + 1, k, curSum + nums[i])) return true;
            used[i] = false;
        }
        return false;
    }
}
