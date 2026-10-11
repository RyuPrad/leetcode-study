static int* heap;
static int size;

static void push(int value) {
    int i = size++;
    heap[i] = value;
    while (i > 0 && heap[(i - 1) / 2] < heap[i]) {
        int p = (i - 1) / 2, t = heap[p]; heap[p] = heap[i]; heap[i] = t;
        i = p;
    }
}

static int pop(void) {
    int top = heap[0];
    heap[0] = heap[--size];
    for (int i = 0; ;) {
        int left = 2 * i + 1, right = left + 1, best = i;
        if (left < size && heap[left] > heap[best]) best = left;
        if (right < size && heap[right] > heap[best]) best = right;
        if (best == i) break;
        int t = heap[best]; heap[best] = heap[i]; heap[i] = t;
        i = best;
    }
    return top;
}

static int byCapital(const void* a, const void* b) {
    int x = ((const int*)a)[0], y = ((const int*)b)[0];
    return (x > y) - (x < y);
}

int findMaximizedCapital(int k, int w, int* profits, int profitsSize, int* capital, int capitalSize) {
    int n = profitsSize;
    int (*projects)[2] = malloc(n * sizeof *projects);
    for (int idx = 0; idx < n; idx++) { projects[idx][0] = capital[idx]; projects[idx][1] = profits[idx]; }
    qsort(projects, n, sizeof *projects, byCapital);
    heap = malloc((n ? n : 1) * sizeof(int));
    size = 0;
    int i = 0;
    for (int j = 0; j < k; j++) {
        while (i < n && projects[i][0] <= w) {
            push(projects[i][1]); i++;
        }
        if (size == 0) break;
        w += pop();
    }
    free(heap);
    free(projects);
    return w;
}
