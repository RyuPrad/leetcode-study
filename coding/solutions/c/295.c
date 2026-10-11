// Two binary heaps: small keeps the lower half (largest on top), large the upper half.
typedef struct {
    int* items;
    int size;
    int capacity;
    int sign; // +1 for a min-heap, -1 for a max-heap
} Heap;

typedef struct {
    Heap small;
    Heap large;
} MedianFinder;

static bool before(Heap* h, int a, int b) { return h->sign * (long long)a < h->sign * (long long)b; }

static void heapPush(Heap* h, int value) {
    if (h->size == h->capacity) { h->capacity *= 2; h->items = realloc(h->items, h->capacity * sizeof(int)); }
    int i = h->size++;
    h->items[i] = value;
    while (i > 0 && before(h, h->items[i], h->items[(i - 1) / 2])) {
        int p = (i - 1) / 2, t = h->items[p]; h->items[p] = h->items[i]; h->items[i] = t;
        i = p;
    }
}

static int heapPop(Heap* h) {
    int top = h->items[0];
    h->items[0] = h->items[--h->size];
    for (int i = 0; ;) {
        int left = 2 * i + 1, right = left + 1, best = i;
        if (left < h->size && before(h, h->items[left], h->items[best])) best = left;
        if (right < h->size && before(h, h->items[right], h->items[best])) best = right;
        if (best == i) break;
        int t = h->items[best]; h->items[best] = h->items[i]; h->items[i] = t;
        i = best;
    }
    return top;
}

MedianFinder* medianFinderCreate() {
    MedianFinder* obj = malloc(sizeof(MedianFinder));
    obj->small = (Heap){ malloc(16 * sizeof(int)), 0, 16, -1 };
    obj->large = (Heap){ malloc(16 * sizeof(int)), 0, 16, 1 };
    return obj;
}

void medianFinderAddNum(MedianFinder* obj, int num) {
    heapPush(&obj->small, num);
    if (obj->small.size && obj->large.size && obj->small.items[0] > obj->large.items[0]) {
        heapPush(&obj->large, heapPop(&obj->small));
    }
    if (obj->small.size > obj->large.size + 1) {
        heapPush(&obj->large, heapPop(&obj->small));
    }
    if (obj->large.size > obj->small.size + 1) {
        heapPush(&obj->small, heapPop(&obj->large));
    }
}

double medianFinderFindMedian(MedianFinder* obj) {
    if (obj->small.size > obj->large.size) return obj->small.items[0];
    if (obj->large.size > obj->small.size) return obj->large.items[0];
    return ((double)obj->small.items[0] + obj->large.items[0]) / 2;
}

void medianFinderFree(MedianFinder* obj) {
    free(obj->small.items);
    free(obj->large.items);
    free(obj);
}
