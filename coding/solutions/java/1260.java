class Solution {
    public List<List<Integer>> shiftGrid(int[][] grid, int k) {
        int m = grid.length, n = grid[0].length, total = m * n;
        Integer[][] res = new Integer[m][n];
        for (int i = 0; i < total; i++) {
            int target = (i + k) % total;
            res[target / n][target % n] = grid[i / n][i % n];
        }
        List<List<Integer>> out = new ArrayList<>();
        for (Integer[] row : res) {
            out.add(Arrays.asList(row));
        }
        return out;
    }
}
