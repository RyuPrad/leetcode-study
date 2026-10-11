bool isValidSudoku(char** board, int boardSize, int* boardColSize) {
    bool rows[9][9] = { { false } }, cols[9][9] = { { false } }, boxes[9][9] = { { false } };
    for (int r = 0; r < 9; r++) {
        for (int c = 0; c < 9; c++) {
            char val = board[r][c];
            if (val == '.') continue;
            int d = val - '1';
            int b = (r / 3) * 3 + c / 3;
            if (rows[r][d] || cols[c][d] || boxes[b][d]) {
                return false;
            }
            rows[r][d] = true;
            cols[c][d] = true;
            boxes[b][d] = true;
        }
    }
    return true;
}
