static int cell(int** board, int n, int square) {
    int r = (square - 1) / n, c = (square - 1) % n;
    return board[n - 1 - r][r % 2 == 0 ? c : n - 1 - c];
}

int snakesAndLadders(int** board, int boardSize, int* boardColSize) {
    int n = boardSize;
    int* moves = malloc((n * n + 1) * sizeof(int));
    for (int s = 0; s <= n * n; s++) {
        moves[s] = -1;
    }
    moves[1] = 0;
    int* queue = malloc((n * n + 1) * sizeof(int));
    int size = 0;
    queue[size++] = 1;
    for (int head = 0; head < size; head++) {
        int square = queue[head];
        int last = square + 6 < n * n ? square + 6 : n * n;
        for (int next = square + 1; next <= last; next++) {
            int value = cell(board, n, next);
            int dest = value == -1 ? next : value;
            if (moves[dest] == -1) {
                moves[dest] = moves[square] + 1;
                queue[size++] = dest;
            }
        }
    }
    int res = moves[n * n];
    free(moves);
    free(queue);
    return res;
}
