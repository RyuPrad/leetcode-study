#define BUCKETS 8

typedef struct {
    int (*pairs[BUCKETS])[2];
    int sizes[BUCKETS];
    int capacities[BUCKETS];
} MyHashMap;

static int hash(int key) {
    return key % BUCKETS;
}

static int indexOf(MyHashMap* obj, int key) {
    int idx = hash(key);
    for (int i = 0; i < obj->sizes[idx]; i++) if (obj->pairs[idx][i][0] == key) return i;
    return -1;
}

MyHashMap* myHashMapCreate() {
    return calloc(1, sizeof(MyHashMap));
}

void myHashMapPut(MyHashMap* obj, int key, int value) {
    int idx = hash(key), at = indexOf(obj, key);
    if (at >= 0) {
        obj->pairs[idx][at][1] = value;
        return;
    }
    if (obj->sizes[idx] == obj->capacities[idx]) {
        obj->capacities[idx] = obj->capacities[idx] ? obj->capacities[idx] * 2 : 4;
        obj->pairs[idx] = realloc(obj->pairs[idx], obj->capacities[idx] * sizeof *obj->pairs[idx]);
    }
    obj->pairs[idx][obj->sizes[idx]][0] = key;
    obj->pairs[idx][obj->sizes[idx]++][1] = value;
}

int myHashMapGet(MyHashMap* obj, int key) {
    int at = indexOf(obj, key);
    return at < 0 ? -1 : obj->pairs[hash(key)][at][1];
}

void myHashMapRemove(MyHashMap* obj, int key) {
    int idx = hash(key), at = indexOf(obj, key);
    if (at < 0) return;
    memmove(obj->pairs[idx] + at, obj->pairs[idx] + at + 1, (obj->sizes[idx] - at - 1) * sizeof *obj->pairs[idx]);
    obj->sizes[idx]--;
}

void myHashMapFree(MyHashMap* obj) {
    for (int i = 0; i < BUCKETS; i++) free(obj->pairs[i]);
    free(obj);
}
