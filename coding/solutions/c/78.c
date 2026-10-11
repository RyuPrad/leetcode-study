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

static void dfs(int* nums, int numsSize, int i, int length) {
    if (i == numsSize) {
        addResult(path, length);
        return;
    }
    path[length] = nums[i];
    dfs(nums, numsSize, i + 1, length + 1);
    dfs(nums, numsSize, i + 1, length);
}

int** subsets(int* nums, int numsSize, int* returnSize, int** returnColumnSizes) {
    resetResults();
    dfs(nums, numsSize, 0, 0);
    return takeResults(returnSize, returnColumnSizes);
}
