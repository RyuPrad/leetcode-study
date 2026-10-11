// Each entry records its use count and when it last moved to that count; the eviction
// victim has the lowest count and, among those, the oldest move, as in the reference.
typedef struct Entry {
    int key;
    int value;
    int freq;
    long long tick;
    UT_hash_handle hh;
} Entry;

typedef struct {
    int capacity;
    long long clock;
    Entry* entries;
} LFUCache;

LFUCache* lFUCacheCreate(int capacity) {
    LFUCache* obj = malloc(sizeof(LFUCache));
    obj->capacity = capacity;
    obj->clock = 0;
    obj->entries = NULL;
    return obj;
}

static void touch(LFUCache* obj, Entry* e) {
    e->freq++;
    e->tick = obj->clock++;
}

int lFUCacheGet(LFUCache* obj, int key) {
    Entry* e;
    HASH_FIND_INT(obj->entries, &key, e);
    if (!e) return -1;
    touch(obj, e);
    return e->value;
}

void lFUCachePut(LFUCache* obj, int key, int value) {
    if (obj->capacity == 0) return;
    Entry *e, *tmp;
    HASH_FIND_INT(obj->entries, &key, e);
    if (e) {
        e->value = value;
        touch(obj, e);
        return;
    }
    if ((int)HASH_COUNT(obj->entries) >= obj->capacity) {
        Entry* evict = NULL;
        HASH_ITER(hh, obj->entries, e, tmp) {
            if (!evict || e->freq < evict->freq || (e->freq == evict->freq && e->tick < evict->tick)) evict = e;
        }
        HASH_DEL(obj->entries, evict);
        free(evict);
    }
    e = malloc(sizeof(Entry));
    e->key = key;
    e->value = value;
    e->freq = 1;
    e->tick = obj->clock++;
    HASH_ADD_INT(obj->entries, key, e);
}

void lFUCacheFree(LFUCache* obj) {
    Entry *e, *tmp;
    HASH_ITER(hh, obj->entries, e, tmp) { HASH_DEL(obj->entries, e); free(e); }
    free(obj);
}
