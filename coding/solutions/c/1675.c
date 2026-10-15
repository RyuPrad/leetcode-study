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

int minimumDeviation(int* nums, int numsSize) {
    heap = malloc(numsSize * sizeof(int));
    size = 0;
    int low = INT_MAX;
    for (int i = 0; i < numsSize; i++) {
        int value = nums[i] % 2 ? nums[i] * 2 : nums[i];
        push(value);
        if (value < low) low = value;
    }
    int res = INT_MAX;
    while (1) {
        int high = pop();
        if (high - low < res) res = high - low;
        if (high % 2) {
            break;
        }
        push(high / 2);
        if (high / 2 < low) low = high / 2;
    }
    free(heap);
    return res;
}
