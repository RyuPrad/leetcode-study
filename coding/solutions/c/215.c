// A min-heap that keeps the k largest values seen so far.
static int* heap;
static int size;

static void swap(int i, int j) { int t = heap[i]; heap[i] = heap[j]; heap[j] = t; }

static void push(int value) {
    int i = size++;
    heap[i] = value;
    while (i > 0 && heap[(i - 1) / 2] > heap[i]) { swap(i, (i - 1) / 2); i = (i - 1) / 2; }
}

static void pop(void) {
    heap[0] = heap[--size];
    for (int i = 0; ;) {
        int left = 2 * i + 1, right = left + 1, smallest = i;
        if (left < size && heap[left] < heap[smallest]) smallest = left;
        if (right < size && heap[right] < heap[smallest]) smallest = right;
        if (smallest == i) break;
        swap(i, smallest);
        i = smallest;
    }
}

int findKthLargest(int* nums, int numsSize, int k) {
    heap = malloc((k + 1) * sizeof(int));
    size = 0;
    for (int i = 0; i < numsSize; i++) {
        push(nums[i]);
        if (size > k) {
            pop();
        }
    }
    int result = heap[0];
    free(heap);
    return result;
}
