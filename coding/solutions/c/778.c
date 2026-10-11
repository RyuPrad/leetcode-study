// A binary heap of (time, row, col) entries ordered by time.
static int (*heap)[3];
static int size;

static void swap(int i, int j) {
    for (int k = 0; k < 3; k++) { int t = heap[i][k]; heap[i][k] = heap[j][k]; heap[j][k] = t; }
}

static void push(int t, int r, int c) {
    int i = size++;
    heap[i][0] = t; heap[i][1] = r; heap[i][2] = c;
    while (i > 0 && heap[(i - 1) / 2][0] > heap[i][0]) { swap(i, (i - 1) / 2); i = (i - 1) / 2; }
}

static void pop(int out[3]) {
    for (int k = 0; k < 3; k++) out[k] = heap[0][k];
    size--;
    for (int k = 0; k < 3; k++) heap[0][k] = heap[size][k];
    for (int i = 0; ;) {
        int left = 2 * i + 1, right = left + 1, s = i;
        if (left < size && heap[left][0] < heap[s][0]) s = left;
        if (right < size && heap[right][0] < heap[s][0]) s = right;
        if (s == i) break;
        swap(i, s);
        i = s;
    }
}

int swimInWater(int** grid, int gridSize, int* gridColSize) {
    int n = gridSize;
    int* time = malloc(n * n * sizeof(int));
    for (int i = 0; i < n * n; i++) time[i] = INT_MAX;
    time[0] = grid[0][0];
    heap = malloc(4 * n * n * sizeof *heap);
    size = 0;
    push(grid[0][0], 0, 0);
    const int dirs[4][2] = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
    int result = -1;
    while (size > 0) {
        int top[3];
        pop(top);
        int t = top[0], r = top[1], c = top[2];
        if (r == n - 1 && c == n - 1) { result = t; break; }
        if (t > time[r * n + c]) continue;
        for (int d = 0; d < 4; d++) {
            int nr = r + dirs[d][0], nc = c + dirs[d][1];
            if (nr >= 0 && nr < n && nc >= 0 && nc < n) {
                int nt = t > grid[nr][nc] ? t : grid[nr][nc];
                if (nt < time[nr * n + nc]) { time[nr * n + nc] = nt; push(nt, nr, nc); }
            }
        }
    }
    free(heap);
    free(time);
    return result;
}
