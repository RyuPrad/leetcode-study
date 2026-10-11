struct Email { char* email; int id; int order; UT_hash_handle hh; };

static int* parent;

static int find(int x) {
    while (parent[x] != x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
    }
    return x;
}

static int byText(const void* a, const void* b) {
    return strcmp(*(char* const*)a, *(char* const*)b);
}

char*** accountsMerge(char*** accounts, int accountsSize, int* accountsColSize, int* returnSize, int** returnColumnSizes) {
    parent = malloc(accountsSize * sizeof(int));
    for (int i = 0; i < accountsSize; i++) parent[i] = i;
    struct Email *emailToId = NULL, *entry, *tmp;
    // Emails in first-seen order, like iterating a JavaScript Map.
    int total = 0;
    for (int i = 0; i < accountsSize; i++) total += accountsColSize[i];
    struct Email** order = malloc((total ? total : 1) * sizeof(struct Email*));
    int distinct = 0;
    for (int i = 0; i < accountsSize; i++) {
        for (int j = 1; j < accountsColSize[i]; j++) {
            char* email = accounts[i][j];
            HASH_FIND_STR(emailToId, email, entry);
            if (entry) {
                parent[find(i)] = find(entry->id);
            } else {
                entry = malloc(sizeof *entry);
                entry->email = email;
                entry->id = i;
                entry->order = distinct;
                order[distinct++] = entry;
                HASH_ADD_KEYPTR(hh, emailToId, entry->email, strlen(entry->email), entry);
            }
        }
    }
    // Groups in the order their root first appears.
    int* groupOf = malloc(accountsSize * sizeof(int));
    for (int i = 0; i < accountsSize; i++) groupOf[i] = -1;
    char*** res = malloc((accountsSize ? accountsSize : 1) * sizeof(char**));
    int* sizes = calloc(accountsSize ? accountsSize : 1, sizeof(int));
    int* roots = malloc((accountsSize ? accountsSize : 1) * sizeof(int));
    int groups = 0;
    for (int e = 0; e < distinct; e++) {
        int root = find(order[e]->id);
        if (groupOf[root] < 0) {
            groupOf[root] = groups;
            roots[groups] = root;
            res[groups] = malloc((total + 1) * sizeof(char*));
            res[groups][0] = accounts[root][0];
            sizes[groups++] = 1;
        }
        int g = groupOf[root];
        res[g][sizes[g]++] = order[e]->email;
    }
    for (int g = 0; g < groups; g++) qsort(res[g] + 1, sizes[g] - 1, sizeof(char*), byText);
    HASH_ITER(hh, emailToId, entry, tmp) { HASH_DEL(emailToId, entry); free(entry); }
    free(order); free(groupOf); free(roots); free(parent);
    *returnSize = groups;
    *returnColumnSizes = sizes;
    return res;
}
