class Solution {
    private Map<Long, Integer> freq;
    private int count;
    private int targetSum;

    public int pathSum(TreeNode root, int targetSum) {
        freq = new HashMap<>();
        freq.put(0L, 1);
        count = 0;
        this.targetSum = targetSum;
        dfs(root, 0L);
        return count;
    }

    // Prefix sums can exceed int, so they are long.
    private void dfs(TreeNode node, long sum) {
        if (node == null) {
            return;
        }
        sum += node.val;
        long need = sum - targetSum;
        int matches = freq.getOrDefault(need, 0);
        count += matches;
        freq.put(sum, freq.getOrDefault(sum, 0) + 1);
        dfs(node.left, sum);
        dfs(node.right, sum);
        freq.put(sum, freq.get(sum) - 1);
        if (freq.get(sum) == 0) {
            freq.remove(sum);
        }
        return;
    }
}
