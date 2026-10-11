bool isValidSudoku(char** board, int boardSize, int* boardColSize) {
    bool rows[9][9] = {{0}}, cols[9][9] = {{0}}, boxes[9][9] = {{0}};
    for (int r = 0; r < 9; r++)
        for (int c = 0; c < boardColSize[r]; c++) {
            if (board[r][c] == '.') continue;
            int d = board[r][c] - '1', b = (r / 3) * 3 + c / 3;
            if (rows[r][d] || cols[c][d] || boxes[b][d]) return false;
            rows[r][d] = cols[c][d] = boxes[b][d] = true;
        }
    return true;
}
