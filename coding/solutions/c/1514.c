typedef struct {
    double prob;
    int node;
} Entry;

static Entry* heap;
static int heapSize;

static void push(double prob, int node) {
    int i = heapSize++;
    heap[i].prob = prob;
    heap[i].node = node;
    while (i > 0 && heap[(i - 1) / 2].prob < heap[i].prob) {
        int p = (i - 1) / 2;
        Entry t = heap[p]; heap[p] = heap[i]; heap[i] = t;
        i = p;
    }
}

static Entry pop(void) {
    Entry top = heap[0];
    heap[0] = heap[--heapSize];
    for (int i = 0; ;) {
        int left = 2 * i + 1, right = left + 1, larger = i;
        if (left < heapSize && heap[left].prob > heap[larger].prob) larger = left;
        if (right < heapSize && heap[right].prob > heap[larger].prob) larger = right;
        if (larger == i) break;
        Entry t = heap[larger]; heap[larger] = heap[i]; heap[i] = t;
        i = larger;
    }
    return top;
}

double maxProbability(int n, int** edges, int edgesSize, int* edgesColSize, double* succProb, int succProbSize, int start_node, int end_node) {
    int* first = calloc(n + 1, sizeof(int));
    for (int i = 0; i < edgesSize; i++) {
        first[edges[i][0] + 1]++;
        first[edges[i][1] + 1]++;
    }
    for (int v = 0; v < n; v++) first[v + 1] += first[v];
    int* fill = malloc(n * sizeof(int));
    for (int v = 0; v < n; v++) fill[v] = first[v];
    int* to = malloc((2 * edgesSize + 1) * sizeof(int));
    double* weight = malloc((2 * edgesSize + 1) * sizeof(double));
    for (int i = 0; i < edgesSize; i++) {
        int a = edges[i][0], b = edges[i][1];
        to[fill[a]] = b;
        weight[fill[a]++] = succProb[i];
        to[fill[b]] = a;
        weight[fill[b]++] = succProb[i];
    }
    double* best = calloc(n, sizeof(double));
    best[start_node] = 1;
    heap = malloc((2 * edgesSize + 1) * sizeof(Entry));
    heapSize = 0;
    push(1, start_node);
    double res = 0;
    while (heapSize > 0) {
        Entry top = pop();
        if (top.node == end_node) {
            res = top.prob;
            break;
        }
        if (top.prob < best[top.node]) {
            continue;
        }
        for (int k = first[top.node]; k < first[top.node + 1]; k++) {
            double candidate = top.prob * weight[k];
            if (candidate > best[to[k]]) {
                best[to[k]] = candidate;
                push(candidate, to[k]);
            }
        }
    }
    free(first);
    free(fill);
    free(to);
    free(weight);
    free(best);
    free(heap);
    return res;
}
