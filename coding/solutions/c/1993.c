typedef struct {
    int n;
    int* parent;
    int* locked;
    int* first;
    int* kids;
    int* stack;
} LockingTree;

LockingTree* lockingTreeCreate(int* parent, int parentSize) {
    LockingTree* obj = malloc(sizeof(LockingTree));
    int n = parentSize;
    obj->n = n;
    obj->parent = malloc(n * sizeof(int));
    memcpy(obj->parent, parent, n * sizeof(int));
    obj->locked = calloc(n, sizeof(int));
    obj->first = calloc(n + 1, sizeof(int));
    for (int i = 1; i < n; i++) obj->first[parent[i] + 1]++;
    for (int v = 0; v < n; v++) obj->first[v + 1] += obj->first[v];
    int* fill = malloc(n * sizeof(int));
    for (int v = 0; v < n; v++) fill[v] = obj->first[v];
    obj->kids = malloc(n * sizeof(int));
    for (int i = 1; i < n; i++) {
        obj->kids[fill[parent[i]]++] = i;
    }
    free(fill);
    obj->stack = malloc(n * sizeof(int));
    return obj;
}

bool lockingTreeLock(LockingTree* obj, int num, int user) {
    if (obj->locked[num]) {
        return false;
    }
    obj->locked[num] = user;
    return true;
}

bool lockingTreeUnlock(LockingTree* obj, int num, int user) {
    if (obj->locked[num] != user) {
        return false;
    }
    obj->locked[num] = 0;
    return true;
}

bool lockingTreeUpgrade(LockingTree* obj, int num, int user) {
    for (int node = num; node != -1; node = obj->parent[node]) {
        if (obj->locked[node]) {
            return false;
        }
    }
    bool found = false;
    int top = 0;
    for (int k = obj->first[num]; k < obj->first[num + 1]; k++) obj->stack[top++] = obj->kids[k];
    while (top > 0) {
        int node = obj->stack[--top];
        if (obj->locked[node]) {
            obj->locked[node] = 0;
            found = true;
        }
        for (int k = obj->first[node]; k < obj->first[node + 1]; k++) obj->stack[top++] = obj->kids[k];
    }
    if (found) {
        obj->locked[num] = user;
    }
    return found;
}

void lockingTreeFree(LockingTree* obj) {
    free(obj->parent);
    free(obj->locked);
    free(obj->first);
    free(obj->kids);
    free(obj->stack);
    free(obj);
}
