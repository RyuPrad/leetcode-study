static int* values;
static int count;
static bool used[16];
static int target;

static int descending(const void* a, const void* b) {
    int x = *(const int*)a, y = *(const int*)b;
    return (y > x) - (y < x);
}

static bool dfs(int start, int k, int curSum) {
    if (k == 0) return true;
    if (curSum == target) return dfs(0, k - 1, 0);
    for (int i = start; i < count; i++) {
        if (used[i] || curSum + values[i] > target) continue;
        used[i] = true;
        if (dfs(i + 1, k, curSum + values[i])) return true;
        used[i] = false;
    }
    return false;
}

bool canPartitionKSubsets(int* nums, int numsSize, int k) {
    int total = 0;
    for (int i = 0; i < numsSize; i++) total += nums[i];
    if (total % k != 0) return false;
    target = total / k;
    qsort(nums, numsSize, sizeof(int), descending);
    if (nums[0] > target) return false;
    values = nums;
    count = numsSize;
    memset(used, 0, sizeof used);
    return dfs(0, k, 0);
}
