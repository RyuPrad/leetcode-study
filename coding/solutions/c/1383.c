typedef struct {
    int eff;
    int spd;
} Engineer;

static int byEfficiencyDescending(const void* a, const void* b) {
    return ((const Engineer*) b)->eff - ((const Engineer*) a)->eff;
}

static int* heap;
static int size;

static void push(int value) {
    int i = size++;
    heap[i] = value;
    while (i > 0 && heap[(i - 1) / 2] > heap[i]) {
        int p = (i - 1) / 2, t = heap[p]; heap[p] = heap[i]; heap[i] = t;
        i = p;
    }
}

static int pop(void) {
    int top = heap[0];
    heap[0] = heap[--size];
    for (int i = 0; ;) {
        int left = 2 * i + 1, right = left + 1, smallest = i;
        if (left < size && heap[left] < heap[smallest]) smallest = left;
        if (right < size && heap[right] < heap[smallest]) smallest = right;
        if (smallest == i) break;
        int t = heap[smallest]; heap[smallest] = heap[i]; heap[i] = t;
        i = smallest;
    }
    return top;
}

int maxPerformance(int n, int* speed, int speedSize, int* efficiency, int efficiencySize, int k) {
    Engineer* engineers = malloc(n * sizeof(Engineer));
    for (int i = 0; i < n; i++) {
        engineers[i].eff = efficiency[i];
        engineers[i].spd = speed[i];
    }
    qsort(engineers, n, sizeof(Engineer), byEfficiencyDescending);
    heap = malloc((n + 1) * sizeof(int));
    size = 0;
    long long sum = 0, best = 0;
    for (int i = 0; i < n; i++) {
        push(engineers[i].spd);
        sum += engineers[i].spd;
        if (size > k) {
            sum -= pop();
        }
        long long performance = sum * engineers[i].eff;
        if (performance > best) {
            best = performance;
        }
    }
    free(engineers);
    free(heap);
    return (int) (best % 1000000007);
}
