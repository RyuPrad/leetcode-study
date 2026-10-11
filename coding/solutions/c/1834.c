// A min-heap of (processing time, index) for the tasks that have arrived.
static int (*heap)[2];
static int size;

static bool less(int i, int j) {
    return heap[i][0] != heap[j][0] ? heap[i][0] < heap[j][0] : heap[i][1] < heap[j][1];
}

static void swap(int i, int j) {
    int a = heap[i][0], b = heap[i][1];
    heap[i][0] = heap[j][0]; heap[i][1] = heap[j][1];
    heap[j][0] = a; heap[j][1] = b;
}

static void push(int proc, int idx) {
    int i = size++;
    heap[i][0] = proc; heap[i][1] = idx;
    while (i > 0 && less(i, (i - 1) / 2)) { swap(i, (i - 1) / 2); i = (i - 1) / 2; }
}

static void pop(int* proc, int* idx) {
    *proc = heap[0][0]; *idx = heap[0][1];
    size--;
    heap[0][0] = heap[size][0]; heap[0][1] = heap[size][1];
    for (int i = 0; ;) {
        int left = 2 * i + 1, right = left + 1, s = i;
        if (left < size && less(left, s)) s = left;
        if (right < size && less(right, s)) s = right;
        if (s == i) break;
        swap(i, s);
        i = s;
    }
}

static int byEnqueue(const void* a, const void* b) {
    const int* x = a; const int* y = b;
    // Stable on equal start times, like JavaScript's sort.
    return x[0] != y[0] ? (x[0] > y[0]) - (x[0] < y[0]) : (x[2] > y[2]) - (x[2] < y[2]);
}

int* getOrder(int** tasks, int tasksSize, int* tasksColSize, int* returnSize) {
    int n = tasksSize;
    int (*indexed)[3] = malloc(n * sizeof *indexed);
    for (int i = 0; i < n; i++) { indexed[i][0] = tasks[i][0]; indexed[i][1] = tasks[i][1]; indexed[i][2] = i; }
    qsort(indexed, n, sizeof *indexed, byEnqueue);
    heap = malloc(n * sizeof *heap);
    size = 0;
    int* res = malloc(n * sizeof(int));
    int count = 0, i = 0;
    long long time = 0;
    while (count < n) {
        while (i < n && indexed[i][0] <= time) {
            push(indexed[i][1], indexed[i][2]);
            i++;
        }
        if (size == 0) {
            time = indexed[i][0];
            continue;
        }
        int proc, idx;
        pop(&proc, &idx);
        time += proc;
        res[count++] = idx;
    }
    free(heap);
    free(indexed);
    *returnSize = n;
    return res;
}
