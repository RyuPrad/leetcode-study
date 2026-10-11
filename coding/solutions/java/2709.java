class Solution {
    private int[] parent;
    private int count;

    public boolean canTraverseAllPairs(int[] nums) {
        int n = nums.length;
        if (n == 1) return true;
        parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
        count = n;
        Map<Integer, Integer> primeToIndex = new HashMap<>();
        for (int i = 0; i < n; i++) {
            int x = nums[i];
            if (x == 1) return false;
            for (int p = 2; p * p <= x; p++) {
                if (x % p == 0) {
                    if (primeToIndex.containsKey(p)) union(i, primeToIndex.get(p));
                    else primeToIndex.put(p, i);
                    while (x % p == 0) x /= p;
                }
            }
            if (x > 1) {
                if (primeToIndex.containsKey(x)) union(i, primeToIndex.get(x));
                else primeToIndex.put(x, i);
            }
        }
        return count == 1;
    }

    private int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }

    private void union(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra != rb) {
            parent[ra] = rb;
            count--;
        }
    }
}
