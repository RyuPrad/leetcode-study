struct Prime { int prime; int index; UT_hash_handle hh; };

static int* parent;
static int count;

static int find(int x) {
    while (parent[x] != x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
    }
    return x;
}

static void unite(int a, int b) {
    int ra = find(a), rb = find(b);
    if (ra != rb) {
        parent[ra] = rb;
        count--;
    }
}

static void link(struct Prime** primes, int p, int i) {
    struct Prime* entry;
    HASH_FIND_INT(*primes, &p, entry);
    if (entry) {
        unite(i, entry->index);
    } else {
        entry = malloc(sizeof *entry);
        entry->prime = p;
        entry->index = i;
        HASH_ADD_INT(*primes, prime, entry);
    }
}

bool canTraverseAllPairs(int* nums, int numsSize) {
    int n = numsSize;
    if (n == 1) return true;
    parent = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) parent[i] = i;
    count = n;
    struct Prime *primes = NULL, *entry, *tmp;
    bool ok = true;
    for (int i = 0; i < n && ok; i++) {
        int x = nums[i];
        if (x == 1) { ok = false; break; }
        for (int p = 2; p * p <= x; p++) {
            if (x % p == 0) {
                link(&primes, p, i);
                while (x % p == 0) x /= p;
            }
        }
        if (x > 1) link(&primes, x, i);
    }
    HASH_ITER(hh, primes, entry, tmp) { HASH_DEL(primes, entry); free(entry); }
    free(parent);
    return ok && count == 1;
}
