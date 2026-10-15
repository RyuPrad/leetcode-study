typedef struct {
    int a;
    int b;
} Pair;

static int byBDescending(const void* x, const void* y) {
    return ((const Pair*) y)->b - ((const Pair*) x)->b;
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

long long maxScore(int* nums1, int nums1Size, int* nums2, int nums2Size, int k) {
    int n = nums1Size;
    Pair* pairs = malloc(n * sizeof(Pair));
    for (int i = 0; i < n; i++) {
        pairs[i].a = nums1[i];
        pairs[i].b = nums2[i];
    }
    qsort(pairs, n, sizeof(Pair), byBDescending);
    heap = malloc((n + 1) * sizeof(int));
    size = 0;
    long long sum = 0, res = 0;
    for (int i = 0; i < n; i++) {
        push(pairs[i].a);
        sum += pairs[i].a;
        if (size > k) {
            sum -= pop();
        }
        if (size == k && sum * pairs[i].b > res) {
            res = sum * pairs[i].b;
        }
    }
    free(pairs);
    free(heap);
    return res;
}
