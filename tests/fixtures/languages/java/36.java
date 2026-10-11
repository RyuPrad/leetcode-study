class Solution {
    public boolean isValidSudoku(char[][] board) {
        Set<String> seen = new HashSet<>();
        for (int r = 0; r < 9; r++)
            for (int c = 0; c < 9; c++) {
                char d = board[r][c];
                if (d == '.') continue;
                if (!seen.add(d + "r" + r) || !seen.add(d + "c" + c) || !seen.add(d + "b" + r / 3 + c / 3)) return false;
            }
        return true;
    }
}
