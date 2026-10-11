// The visualizer's MinHeap: entries of up to three ints ordered by the first.
typedef struct { int (*heap)[3]; int length; int capacity; } MinHeap;
static MinHeap* heapCreate(void) { MinHeap* obj = calloc(1, sizeof(MinHeap)); obj->capacity = 64; obj->heap = malloc(obj->capacity * sizeof *obj->heap); return obj; }
static int heapSize(MinHeap* obj) { return obj->length; }
static void heapPush(MinHeap* obj, int a, int b, int c) {
    int (*h)[3] = obj->heap;
    if (obj->length == obj->capacity) { obj->capacity *= 2; h = obj->heap = realloc(obj->heap, obj->capacity * sizeof *obj->heap); } h[obj->length][0] = a; h[obj->length][1] = b; h[obj->length++][2] = c;
    int i = obj->length - 1;
    while (i > 0) {
        int p = (i - 1) >> 1;
        if (h[p][0] <= h[i][0]) break;
        for (int k = 0; k < 3; k++) { int t = h[p][k]; h[p][k] = h[i][k]; h[i][k] = t; }
        i = p;
    }
}
static void heapPop(MinHeap* obj, int top[3]) {
    int (*h)[3] = obj->heap;
    memcpy(top, h[0], sizeof h[0]);
    obj->length--;
    if (obj->length > 0) {
        memcpy(h[0], h[obj->length], sizeof h[0]);
        int i = 0;
        while (1) {
            int l = 2 * i + 1, r = 2 * i + 2, s = i;
            if (l < obj->length && h[l][0] < h[s][0]) s = l;
            if (r < obj->length && h[r][0] < h[s][0]) s = r;
            if (s == i) break;
            for (int k = 0; k < 3; k++) { int t = h[s][k]; h[s][k] = h[i][k]; h[i][k] = t; }
            i = s;
        }
    }
}

int minimumEffortPath(int** heights, int heightsSize, int* heightsColSize) {
    int rows = heightsSize, cols = heightsColSize[0];
    int* effort = malloc(rows * cols * sizeof(int)); for (int i = 0; i < rows * cols; i++) effort[i] = INT_MAX;
    effort[0] = 0;
    MinHeap* heap = heapCreate();
    heapPush(heap, 0, 0, 0);
    const int dirs[4][2] = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
    while (heapSize(heap) > 0) {
        int top[3]; heapPop(heap, top); int e = top[0], r = top[1], c = top[2];
        if (r == rows - 1 && c == cols - 1) return e;
        if (e > effort[r * cols + c]) continue;
        for (int d = 0; d < 4; d++) {
            int nr = r + dirs[d][0], nc = c + dirs[d][1];
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                int diff = abs(heights[nr][nc] - heights[r][c]);
                int ne = e > diff ? e : diff;
                if (ne < effort[nr * cols + nc]) { effort[nr * cols + nc] = ne; heapPush(heap, ne, nr, nc); }
            }
        }
    }
    return 0;
}
