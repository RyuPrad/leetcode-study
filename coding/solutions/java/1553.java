class Solution {
    private Map<Integer, Integer> memo;

    public int minDays(int n) {
        memo = new HashMap<>();
        memo.put(0, 0);
        memo.put(1, 1);
        return dfs(n);
    }

    private int dfs(int k) {
        if (memo.containsKey(k)) {
            return memo.get(k);
        }
        int half = k % 2 + dfs(k / 2);
        int third = k % 3 + dfs(k / 3);
        int res = 1 + Math.min(half, third);
        memo.put(k, res);
        return res;
    }
}
