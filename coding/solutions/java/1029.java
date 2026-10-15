class Solution {
    public int twoCitySchedCost(int[][] costs) {
        Arrays.sort(costs, (a, b) -> (a[0] - a[1]) - (b[0] - b[1]));
        int n = costs.length / 2;
        int res = 0;
        for (int i = 0; i < n; i++) {
            res += costs[i][0] + costs[n + i][1];
        }
        return res;
    }
}
