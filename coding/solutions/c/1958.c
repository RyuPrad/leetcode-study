bool checkMove(char** board, int boardSize, int* boardColSize, int rMove, int cMove, char color) {
    char other = color == 'B' ? 'W' : 'B';
    int dirs[8][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}, {1, 1}, {1, -1}, {-1, 1}, {-1, -1}};
    for (int d = 0; d < 8; d++) {
        int r = rMove + dirs[d][0], c = cMove + dirs[d][1], length = 1;
        while (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] == other) {
            r += dirs[d][0];
            c += dirs[d][1];
            length++;
        }
        if (length >= 2 && r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] == color) {
            return true;
        }
    }
    return false;
}
