static int (*heap)[3];
static int size;

static void swap(int i, int j) {
    for (int k = 0; k < 3; k++) { int t = heap[i][k]; heap[i][k] = heap[j][k]; heap[j][k] = t; }
}

static void push(int e, int r, int c) {
    int i = size++;
    heap[i][0] = e; heap[i][1] = r; heap[i][2] = c;
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

int minimumEffortPath(int** heights, int heightsSize, int* heightsColSize) {
    int rows = heightsSize, cols = heightsColSize[0];
    int* effort = malloc(rows * cols * sizeof(int));
    for (int i = 0; i < rows * cols; i++) effort[i] = INT_MAX;
    effort[0] = 0;
    heap = malloc(4 * rows * cols * sizeof *heap + sizeof *heap);
    size = 0;
    push(0, 0, 0);
    const int dirs[4][2] = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
    int result = 0;
    while (size > 0) {
        int top[3];
        pop(top);
        int e = top[0], r = top[1], c = top[2];
        if (r == rows - 1 && c == cols - 1) { result = e; break; }
        if (e > effort[r * cols + c]) continue;
        for (int d = 0; d < 4; d++) {
            int nr = r + dirs[d][0], nc = c + dirs[d][1];
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                int diff = abs(heights[nr][nc] - heights[r][c]);
                int ne = e > diff ? e : diff;
                if (ne < effort[nr * cols + nc]) { effort[nr * cols + nc] = ne; push(ne, nr, nc); }
            }
        }
    }
    free(heap);
    free(effort);
    return result;
}
