class Solution {
    public Node construct(int[][] grid) { return build(grid, 0, 0, grid.length); }
    private Node build(int[][] grid, int r, int c, int n) {
        boolean same = true;
        for (int i = r; i < r + n && same; i++) for (int j = c; j < c + n; j++) if (grid[i][j] != grid[r][c]) { same = false; break; }
        if (same) return new Node(grid[r][c] == 1, true);
        int h = n / 2;
        return new Node(true, false, build(grid, r, c, h), build(grid, r, c + h, h), build(grid, r + h, c, h), build(grid, r + h, c + h, h));
    }
}
