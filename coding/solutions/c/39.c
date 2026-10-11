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

static int path[512];

static void dfs(int* candidates, int candidatesSize, int start, int remain, int length) {
    if (remain == 0) {
        addResult(path, length);
        return;
    }
    if (remain < 0) return;
    for (int i = start; i < candidatesSize; i++) {
        path[length] = candidates[i];
        dfs(candidates, candidatesSize, i, remain - candidates[i], length + 1);
    }
}

int** combinationSum(int* candidates, int candidatesSize, int target, int* returnSize, int** returnColumnSizes) {
    resetResults();
    dfs(candidates, candidatesSize, 0, target, 0);
    return takeResults(returnSize, returnColumnSizes);
}
