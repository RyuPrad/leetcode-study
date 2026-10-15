typedef struct {
    int key;
    int value;
    UT_hash_handle hh;
} Memo;

static Memo* memo;

static void remember(int key, int value) {
    Memo* entry = malloc(sizeof(Memo));
    entry->key = key;
    entry->value = value;
    HASH_ADD_INT(memo, key, entry);
}

static int dfs(int k) {
    Memo* found;
    HASH_FIND_INT(memo, &k, found);
    if (found) {
        return found->value;
    }
    int half = k % 2 + dfs(k / 2);
    int third = k % 3 + dfs(k / 3);
    int res = 1 + (half < third ? half : third);
    remember(k, res);
    return res;
}

int minDays(int n) {
    memo = NULL;
    remember(0, 0);
    remember(1, 1);
    int res = dfs(n);
    Memo *entry, *tmp;
    HASH_ITER(hh, memo, entry, tmp) {
        HASH_DEL(memo, entry);
        free(entry);
    }
    return res;
}
