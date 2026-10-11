static int** res;
static int* cols;
static int count, capacity;

static void addResult(const int* values, int size) {
    if (count == capacity) {
        capacity = capacity ? capacity * 2 : 16;
        res = realloc(res, capacity * sizeof(int*));
        cols = realloc(cols, capacity * sizeof(int));
    }
    res[count] = malloc((size ? size : 1) * sizeof(int));
    memcpy(res[count], values, size * sizeof(int));
    cols[count++] = size;
}

static void resetResults(void) { res = NULL; cols = NULL; count = 0; capacity = 0; }

static int** takeResults(int* returnSize, int** returnColumnSizes) {
    *returnSize = count;
    *returnColumnSizes = cols ? cols : malloc(sizeof(int));
    return res ? res : malloc(sizeof(int*));
}

static int path[32];

static int ascending(const void* a, const void* b) {
    int x = *(const int*)a, y = *(const int*)b;
    return (x > y) - (x < y);
}

static void dfs(int* nums, int numsSize, int start, int length) {
    addResult(path, length);
    for (int i = start; i < numsSize; i++) {
        if (i > start && nums[i] == nums[i - 1]) continue;
        path[length] = nums[i];
        dfs(nums, numsSize, i + 1, length + 1);
    }
}

int** subsetsWithDup(int* nums, int numsSize, int* returnSize, int** returnColumnSizes) {
    qsort(nums, numsSize, sizeof(int), ascending);
    resetResults();
    dfs(nums, numsSize, 0, 0);
    return takeResults(returnSize, returnColumnSizes);
}
