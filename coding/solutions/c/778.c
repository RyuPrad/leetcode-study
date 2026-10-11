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

int swimInWater(int** grid, int gridSize, int* gridColSize) {
    int n = gridSize;
    int* time = malloc(n * n * sizeof(int)); for (int i = 0; i < n * n; i++) time[i] = INT_MAX;
    time[0] = grid[0][0];
    MinHeap* heap = heapCreate();
    heapPush(heap, grid[0][0], 0, 0);
    const int dirs[4][2] = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
    while (heapSize(heap) > 0) {
        int top[3]; heapPop(heap, top); int t = top[0], r = top[1], c = top[2];
        if (r == n - 1 && c == n - 1) return t;
        if (t > time[r * n + c]) continue;
        for (int d = 0; d < 4; d++) {
            int nr = r + dirs[d][0], nc = c + dirs[d][1];
            if (nr >= 0 && nr < n && nc >= 0 && nc < n) {
                int nt = t > grid[nr][nc] ? t : grid[nr][nc];
                if (nt < time[nr * n + nc]) { time[nr * n + nc] = nt; heapPush(heap, nt, nr, nc); }
            }
        }
    }
    return -1;
}
