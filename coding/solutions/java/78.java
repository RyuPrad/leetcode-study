class Solution {
    private final List<List<Integer>> res = new ArrayList<>();
    private final List<Integer> path = new ArrayList<>();

    public List<List<Integer>> subsets(int[] nums) {
        dfs(nums, 0);
        return res;
    }

    private void dfs(int[] nums, int i) {
        if (i == nums.length) {
            res.add(new ArrayList<>(path));
            return;
        }
        path.add(nums[i]);
        dfs(nums, i + 1);
        path.remove(path.size() - 1);
        dfs(nums, i + 1);
    }
}
