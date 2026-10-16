class Solution {
    private final Map<Integer, List<TreeNode>> memo = new HashMap<>();

    public List<TreeNode> allPossibleFBT(int n) {
        memo.put(1, new ArrayList<>(List.of(new TreeNode(0))));
        return n % 2 == 1 ? build(n) : new ArrayList<>();
    }

    private List<TreeNode> build(int k) {
        if (memo.containsKey(k)) {
            return memo.get(k);
        }
        List<TreeNode> res = new ArrayList<>();
        for (int left = 1; left < k; left += 2) {
            List<TreeNode> lefts = build(left);
            List<TreeNode> rights = build(k - 1 - left);
            for (TreeNode l : lefts) {
                for (TreeNode r : rights) {
                    res.add(new TreeNode(0, l, r));
                }
            }
        }
        memo.put(k, res);
        return res;
    }
}
