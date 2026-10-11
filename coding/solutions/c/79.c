static bool dfs(char** board, int rows, int cols, char* word, int r, int c, int i) {
    if (!word[i]) return true;
    if (r < 0 || c < 0 || r >= rows || c >= cols || board[r][c] != word[i]) return false;
    char temp = board[r][c];
    board[r][c] = '#';
    bool found = dfs(board, rows, cols, word, r + 1, c, i + 1) || dfs(board, rows, cols, word, r - 1, c, i + 1)
        || dfs(board, rows, cols, word, r, c + 1, i + 1) || dfs(board, rows, cols, word, r, c - 1, i + 1);
    board[r][c] = temp;
    return found;
}

bool exist(char** board, int boardSize, int* boardColSize, char* word) {
    for (int r = 0; r < boardSize; r++) {
        for (int c = 0; c < boardColSize[0]; c++) {
            if (dfs(board, boardSize, boardColSize[0], word, r, c, 0)) return true;
        }
    }
    return false;
}
