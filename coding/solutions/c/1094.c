// A min-heap of (end, passengers) for the trips currently in the car.
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

static void push(int end, int num) {
    int i = size++;
    heap[i][0] = end; heap[i][1] = num;
    while (i > 0 && less(i, (i - 1) / 2)) { swap(i, (i - 1) / 2); i = (i - 1) / 2; }
}

static int pop(void) {
    int num = heap[0][1];
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
    return num;
}

static int byStart(const void* a, const void* b) {
    int x = (*(int* const*)a)[1], y = (*(int* const*)b)[1];
    return (x > y) - (x < y);
}

bool carPooling(int** trips, int tripsSize, int* tripsColSize, int capacity) {
    qsort(trips, tripsSize, sizeof(int*), byStart);
    heap = malloc((tripsSize ? tripsSize : 1) * sizeof *heap);
    size = 0;
    int cur = 0;
    bool ok = true;
    for (int t = 0; t < tripsSize && ok; t++) {
        int num = trips[t][0], start = trips[t][1], end = trips[t][2];
        while (size && heap[0][0] <= start) {
            cur -= pop();
        }
        cur += num;
        if (cur > capacity) ok = false;
        else push(end, num);
    }
    free(heap);
    return ok;
}
