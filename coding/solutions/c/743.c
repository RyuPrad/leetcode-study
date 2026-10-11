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

int networkDelayTime(int** times, int timesSize, int* timesColSize, int n, int k) {
    // adj as an edge list scan per node keeps the code close to the reference.
    int* dist = malloc((n + 1) * sizeof(int)); for (int i = 0; i <= n; i++) dist[i] = INT_MAX;
    dist[k] = 0;
    MinHeap* heap = heapCreate();
    heapPush(heap, 0, k, 0);
    while (heapSize(heap) > 0) {
        int top[3]; heapPop(heap, top); int d = top[0], node = top[1];
        if (d > dist[node]) continue;
        for (int e = 0; e < timesSize; e++) { if (times[e][0] != node) continue; int nei = times[e][1], w = times[e][2];
            if (d + w < dist[nei]) {
                dist[nei] = d + w;
                heapPush(heap, dist[nei], nei, 0);
            }
        }
    }
    int ans = 0;
    for (int i = 1; i <= n; i++) {
        if (dist[i] == INT_MAX) { ans = -1; break; }
        if (dist[i] > ans) ans = dist[i];
    }
    free(dist);
    return ans;
}
