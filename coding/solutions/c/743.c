// Dijkstra with a binary heap of (distance, node) pairs.
static int (*heap)[2];
static int size;

static void swap(int i, int j) {
    int d = heap[i][0], n = heap[i][1];
    heap[i][0] = heap[j][0]; heap[i][1] = heap[j][1];
    heap[j][0] = d; heap[j][1] = n;
}

static void push(int dist, int node) {
    int i = size++;
    heap[i][0] = dist; heap[i][1] = node;
    while (i > 0 && heap[(i - 1) / 2][0] > heap[i][0]) { swap(i, (i - 1) / 2); i = (i - 1) / 2; }
}

static void pop(int* dist, int* node) {
    *dist = heap[0][0]; *node = heap[0][1];
    size--;
    heap[0][0] = heap[size][0]; heap[0][1] = heap[size][1];
    for (int i = 0; ;) {
        int left = 2 * i + 1, right = left + 1, s = i;
        if (left < size && heap[left][0] < heap[s][0]) s = left;
        if (right < size && heap[right][0] < heap[s][0]) s = right;
        if (s == i) break;
        swap(i, s);
        i = s;
    }
}

int networkDelayTime(int** times, int timesSize, int* timesColSize, int n, int k) {
    int* dist = malloc((n + 1) * sizeof(int));
    for (int i = 0; i <= n; i++) dist[i] = INT_MAX;
    dist[k] = 0;
    heap = malloc((timesSize + 1) * sizeof *heap);
    size = 0;
    push(0, k);
    while (size > 0) {
        int d, node;
        pop(&d, &node);
        if (d > dist[node]) continue;
        for (int e = 0; e < timesSize; e++) {
            if (times[e][0] != node) continue;
            int nei = times[e][1], w = times[e][2];
            if (d + w < dist[nei]) {
                dist[nei] = d + w;
                push(dist[nei], nei);
            }
        }
    }
    int ans = 0;
    for (int i = 1; i <= n; i++) {
        if (dist[i] == INT_MAX) { ans = -1; break; }
        if (dist[i] > ans) ans = dist[i];
    }
    free(heap);
    free(dist);
    return ans;
}
