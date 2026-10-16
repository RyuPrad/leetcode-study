struct Prefix { long long sum; int count; UT_hash_handle hh; };

static struct Prefix* freq;
static int count;

static int freqGet(long long sum) {
    struct Prefix* entry;
    HASH_FIND(hh, freq, &sum, sizeof(long long), entry);
    return entry ? entry->count : 0;
}

static void freqSet(long long sum, int value) {
    struct Prefix* entry;
    HASH_FIND(hh, freq, &sum, sizeof(long long), entry);
    if (!entry) {
        entry = malloc(sizeof *entry);
        entry->sum = sum;
        HASH_ADD(hh, freq, sum, sizeof(long long), entry);
    }
    entry->count = value;
}

static void freqDelete(long long sum) {
    struct Prefix* entry;
    HASH_FIND(hh, freq, &sum, sizeof(long long), entry);
    if (entry) {
        HASH_DEL(freq, entry);
        free(entry);
    }
}

// Prefix sums can exceed int, so they are long long.
static void dfs(struct TreeNode* node, long long sum, int targetSum) {
    if (node == NULL) {
        return;
    }
    sum += node->val;
    long long need = sum - targetSum;
    int matches = freqGet(need);
    count += matches;
    freqSet(sum, freqGet(sum) + 1);
    dfs(node->left, sum, targetSum);
    dfs(node->right, sum, targetSum);
    freqSet(sum, freqGet(sum) - 1);
    if (freqGet(sum) == 0) {
        freqDelete(sum);
    }
    return;
}

int pathSum(struct TreeNode* root, int targetSum) {
    freq = NULL;
    freqSet(0, 1);
    count = 0;
    dfs(root, 0, targetSum);
    freqDelete(0);
    return count;
}
