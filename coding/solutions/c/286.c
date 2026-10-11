void wallsAndGates(int** rooms, int roomsSize, int* roomsColSize) {
    int rows = roomsSize;
    int cols = roomsColSize[0];
    const int INF = 2147483647;
    int* queue = malloc(rows * cols * 2 * sizeof(int));
    int head = 0, tail = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (rooms[r][c] == 0) { queue[tail++] = r; queue[tail++] = c; }
        }
    }
    const int dirs[4][2] = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
    while (head < tail) {
        int r = queue[head++], c = queue[head++];
        for (int d = 0; d < 4; d++) {
            int nr = r + dirs[d][0];
            int nc = c + dirs[d][1];
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && rooms[nr][nc] == INF) {
                rooms[nr][nc] = rooms[r][c] + 1;
                queue[tail++] = nr;
                queue[tail++] = nc;
            }
        }
    }
    free(queue);
}
