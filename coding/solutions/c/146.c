// A hash map for lookups plus a doubly linked list ordered from least to most recent.
typedef struct Entry {
    int key;
    int value;
    struct Entry* prev;
    struct Entry* next;
    UT_hash_handle hh;
} Entry;

typedef struct {
    int capacity;
    Entry* cache;
    Entry order;
} LRUCache;

static void detach(Entry* e) {
    e->prev->next = e->next;
    e->next->prev = e->prev;
}

static void append(LRUCache* obj, Entry* e) {
    e->prev = obj->order.prev;
    e->next = &obj->order;
    obj->order.prev->next = e;
    obj->order.prev = e;
}

LRUCache* lRUCacheCreate(int capacity) {
    LRUCache* obj = malloc(sizeof(LRUCache));
    obj->capacity = capacity;
    obj->cache = NULL;
    obj->order.prev = obj->order.next = &obj->order;
    return obj;
}

int lRUCacheGet(LRUCache* obj, int key) {
    Entry* e;
    HASH_FIND_INT(obj->cache, &key, e);
    if (!e) return -1;
    detach(e);
    append(obj, e);
    return e->value;
}

void lRUCachePut(LRUCache* obj, int key, int value) {
    Entry* e;
    HASH_FIND_INT(obj->cache, &key, e);
    if (e) {
        detach(e);
    } else {
        if ((int)HASH_COUNT(obj->cache) >= obj->capacity) {
            Entry* lru = obj->order.next;
            detach(lru);
            HASH_DEL(obj->cache, lru);
            free(lru);
        }
        e = malloc(sizeof(Entry));
        e->key = key;
        HASH_ADD_INT(obj->cache, key, e);
    }
    e->value = value;
    append(obj, e);
}

void lRUCacheFree(LRUCache* obj) {
    Entry *e, *tmp;
    HASH_ITER(hh, obj->cache, e, tmp) { HASH_DEL(obj->cache, e); free(e); }
    free(obj);
}
