static void mark(char** board, int rows, int cols, int r, int c) {
    if (r < 0 || c < 0 || r >= rows || c >= cols || board[r][c] != 'O') return;
    board[r][c] = '#';
    mark(board, rows, cols, r + 1, c); mark(board, rows, cols, r - 1, c); mark(board, rows, cols, r, c + 1); mark(board, rows, cols, r, c - 1);
}
void solve(char** board, int boardSize, int* boardColSize) {
    int cols = boardSize ? boardColSize[0] : 0;
    for (int r = 0; r < boardSize; r++) { mark(board, boardSize, cols, r, 0); mark(board, boardSize, cols, r, cols - 1); }
    for (int c = 0; c < cols; c++) { mark(board, boardSize, cols, 0, c); mark(board, boardSize, cols, boardSize - 1, c); }
    for (int r = 0; r < boardSize; r++) for (int c = 0; c < cols; c++) board[r][c] = board[r][c] == '#' ? 'O' : 'X';
}
