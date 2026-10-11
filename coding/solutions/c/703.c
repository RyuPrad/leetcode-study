// A min-heap of the k largest values; its top is the kth largest.
typedef struct {
    int k;
    int* heap;
    int size;
} KthLargest;

static void swap(int* heap, int i, int j) { int t = heap[i]; heap[i] = heap[j]; heap[j] = t; }

static void push(KthLargest* obj, int value) {
    int i = obj->size++;
    obj->heap[i] = value;
    while (i > 0 && obj->heap[(i - 1) / 2] > obj->heap[i]) { swap(obj->heap, i, (i - 1) / 2); i = (i - 1) / 2; }
}

static void pop(KthLargest* obj) {
    obj->heap[0] = obj->heap[--obj->size];
    for (int i = 0; ;) {
        int left = 2 * i + 1, right = left + 1, smallest = i;
        if (left < obj->size && obj->heap[left] < obj->heap[smallest]) smallest = left;
        if (right < obj->size && obj->heap[right] < obj->heap[smallest]) smallest = right;
        if (smallest == i) break;
        swap(obj->heap, i, smallest);
        i = smallest;
    }
}

int kthLargestAdd(KthLargest* obj, int val) {
    push(obj, val);
    if (obj->size > obj->k) {
        pop(obj);
    }
    return obj->heap[0];
}

KthLargest* kthLargestCreate(int k, int* nums, int numsSize) {
    KthLargest* obj = malloc(sizeof(KthLargest));
    obj->k = k;
    obj->heap = malloc((k + 1) * sizeof(int));
    obj->size = 0;
    for (int i = 0; i < numsSize; i++) {
        kthLargestAdd(obj, nums[i]);
    }
    return obj;
}

void kthLargestFree(KthLargest* obj) {
    free(obj->heap);
    free(obj);
}
