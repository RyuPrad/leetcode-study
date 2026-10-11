/*
// Definition for a QuadTree node.
class Node {
    public boolean val;
    public boolean isLeaf;
    public Node topLeft, topRight, bottomLeft, bottomRight;
}
*/
class Solution {
    public Node construct(int[][] grid) {
        return build(grid, 0, 0, grid.length);
    }

    private Node build(int[][] grid, int r, int c, int n) {
        boolean same = true;
        for (int i = r; i < r + n; i++) {
            for (int j = c; j < c + n; j++) {
                if (grid[i][j] != grid[r][c]) same = false;
            }
        }
        if (same) return new Node(grid[r][c] == 1, true);
        int half = n / 2;
        return new Node(true, false,
            build(grid, r, c, half),
            build(grid, r, c + half, half),
            build(grid, r + half, c, half),
            build(grid, r + half, c + half, half));
    }
}
