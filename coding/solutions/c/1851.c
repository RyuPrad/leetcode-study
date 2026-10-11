// A min-heap of (size, right end) for intervals that start at or before the query.
static int (*heap)[2];
static int size;

static void swap(int i, int j) {
    int a = heap[i][0], b = heap[i][1];
    heap[i][0] = heap[j][0]; heap[i][1] = heap[j][1];
    heap[j][0] = a; heap[j][1] = b;
}

static void push(int length, int right) {
    int i = size++;
    heap[i][0] = length; heap[i][1] = right;
    while (i > 0 && heap[(i - 1) / 2][0] > heap[i][0]) { swap(i, (i - 1) / 2); i = (i - 1) / 2; }
}

static void pop(void) {
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

static int byStart(const void* a, const void* b) {
    int x = (*(int* const*)a)[0], y = (*(int* const*)b)[0];
    return (x > y) - (x < y);
}

static int byQuery(const void* a, const void* b) {
    const int* x = a; const int* y = b;
    return x[0] != y[0] ? (x[0] > y[0]) - (x[0] < y[0]) : (x[1] > y[1]) - (x[1] < y[1]);
}

int* minInterval(int** intervals, int intervalsSize, int* intervalsColSize, int* queries, int queriesSize, int* returnSize) {
    qsort(intervals, intervalsSize, sizeof(int*), byStart);
    int (*sorted)[2] = malloc((queriesSize ? queriesSize : 1) * sizeof *sorted);
    for (int q = 0; q < queriesSize; q++) { sorted[q][0] = queries[q]; sorted[q][1] = q; }
    qsort(sorted, queriesSize, sizeof *sorted, byQuery);
    int* res = malloc((queriesSize ? queriesSize : 1) * sizeof(int));
    heap = malloc((intervalsSize ? intervalsSize : 1) * sizeof *heap);
    size = 0;
    int i = 0;
    for (int k = 0; k < queriesSize; k++) {
        int q = sorted[k][0], idx = sorted[k][1];
        while (i < intervalsSize && intervals[i][0] <= q) {
            push(intervals[i][1] - intervals[i][0] + 1, intervals[i][1]);
            i++;
        }
        while (size > 0 && heap[0][1] < q) {
            pop();
        }
        res[idx] = size > 0 ? heap[0][0] : -1;
    }
    free(heap);
    free(sorted);
    *returnSize = queriesSize;
    return res;
}
