static void dfs(char** board, int rows, int cols, int r, int c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] != 'O') return;
    board[r][c] = 'S';
    dfs(board, rows, cols, r + 1, c);
    dfs(board, rows, cols, r - 1, c);
    dfs(board, rows, cols, r, c + 1);
    dfs(board, rows, cols, r, c - 1);
}

void solve(char** board, int boardSize, int* boardColSize) {
    int rows = boardSize;
    int cols = boardColSize[0];
    for (int r = 0; r < rows; r++) {
        dfs(board, rows, cols, r, 0);
        dfs(board, rows, cols, r, cols - 1);
    }
    for (int c = 0; c < cols; c++) {
        dfs(board, rows, cols, 0, c);
        dfs(board, rows, cols, rows - 1, c);
    }
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (board[r][c] == 'O') board[r][c] = 'X';
            else if (board[r][c] == 'S') board[r][c] = 'O';
        }
    }
}
