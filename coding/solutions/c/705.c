#define BUCKETS 8

typedef struct {
    int* keys[BUCKETS];
    int sizes[BUCKETS];
    int capacities[BUCKETS];
} MyHashSet;

static int hash(int key) {
    return key % BUCKETS;
}

static int indexOf(MyHashSet* obj, int key) {
    int idx = hash(key);
    for (int i = 0; i < obj->sizes[idx]; i++) if (obj->keys[idx][i] == key) return i;
    return -1;
}

MyHashSet* myHashSetCreate() {
    return calloc(1, sizeof(MyHashSet));
}

void myHashSetAdd(MyHashSet* obj, int key) {
    int idx = hash(key);
    if (indexOf(obj, key) >= 0) return;
    if (obj->sizes[idx] == obj->capacities[idx]) {
        obj->capacities[idx] = obj->capacities[idx] ? obj->capacities[idx] * 2 : 4;
        obj->keys[idx] = realloc(obj->keys[idx], obj->capacities[idx] * sizeof(int));
    }
    obj->keys[idx][obj->sizes[idx]++] = key;
}

void myHashSetRemove(MyHashSet* obj, int key) {
    int idx = hash(key), at = indexOf(obj, key);
    if (at < 0) return;
    memmove(obj->keys[idx] + at, obj->keys[idx] + at + 1, (obj->sizes[idx] - at - 1) * sizeof(int));
    obj->sizes[idx]--;
}

bool myHashSetContains(MyHashSet* obj, int key) {
    return indexOf(obj, key) >= 0;
}

void myHashSetFree(MyHashSet* obj) {
    for (int i = 0; i < BUCKETS; i++) free(obj->keys[i]);
    free(obj);
}
