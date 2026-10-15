static bool smaller(const char* a, const char* b) {
    size_t la = strlen(a), lb = strlen(b);
    return la < lb || (la == lb && strcmp(a, b) < 0);
}

static char** heap;
static int size;

static void push(char* value) {
    int i = size++;
    heap[i] = value;
    while (i > 0 && smaller(heap[i], heap[(i - 1) / 2])) {
        int p = (i - 1) / 2;
        char* t = heap[p]; heap[p] = heap[i]; heap[i] = t;
        i = p;
    }
}

static void pop(void) {
    heap[0] = heap[--size];
    for (int i = 0; ;) {
        int left = 2 * i + 1, right = left + 1, first = i;
        if (left < size && smaller(heap[left], heap[first])) first = left;
        if (right < size && smaller(heap[right], heap[first])) first = right;
        if (first == i) break;
        char* t = heap[first]; heap[first] = heap[i]; heap[i] = t;
        i = first;
    }
}

char* kthLargestNumber(char** nums, int numsSize, int k) {
    heap = malloc((k + 1) * sizeof(char*));
    size = 0;
    for (int i = 0; i < numsSize; i++) {
        push(nums[i]);
        if (size > k) {
            pop();
        }
    }
    char* res = heap[0];
    free(heap);
    return res;
}
