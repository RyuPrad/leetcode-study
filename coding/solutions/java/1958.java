class Solution {
    public boolean checkMove(char[][] board, int rMove, int cMove, char color) {
        char other = color == 'B' ? 'W' : 'B';
        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}, {1, 1}, {1, -1}, {-1, 1}, {-1, -1}};
        for (int[] d : dirs) {
            int r = rMove + d[0], c = cMove + d[1], length = 1;
            while (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] == other) {
                r += d[0];
                c += d[1];
                length++;
            }
            if (length >= 2 && r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] == color) {
                return true;
            }
        }
        return false;
    }
}
