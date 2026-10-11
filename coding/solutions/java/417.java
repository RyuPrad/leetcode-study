class Solution {
    private static final int[][] DIRS = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
    private int[][] heights;

    public List<List<Integer>> pacificAtlantic(int[][] heights) {
        this.heights = heights;
        int rows = heights.length;
        int cols = heights[0].length;
        boolean[][] pac = new boolean[rows][cols];
        boolean[][] atl = new boolean[rows][cols];
        for (int r = 0; r < rows; r++) {
            dfs(r, 0, pac, Integer.MIN_VALUE);
            dfs(r, cols - 1, atl, Integer.MIN_VALUE);
        }
        for (int c = 0; c < cols; c++) {
            dfs(0, c, pac, Integer.MIN_VALUE);
            dfs(rows - 1, c, atl, Integer.MIN_VALUE);
        }
        List<List<Integer>> res = new ArrayList<>();
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (pac[r][c] && atl[r][c]) res.add(List.of(r, c));
            }
        }
        return res;
    }

    private void dfs(int r, int c, boolean[][] ocean, int prev) {
        if (r < 0 || r >= heights.length || c < 0 || c >= heights[0].length) return;
        if (ocean[r][c] || heights[r][c] < prev) return;
        ocean[r][c] = true;
        for (int[] dir : DIRS) dfs(r + dir[0], c + dir[1], ocean, heights[r][c]);
    }
}
