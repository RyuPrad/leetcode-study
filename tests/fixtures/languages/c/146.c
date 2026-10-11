typedef struct Entry { int key; int value; struct Entry *prev, *next; UT_hash_handle hh; } Entry;
typedef struct { int capacity; Entry* map; Entry head; } LRUCache;
static void detach(Entry* e) { e->prev->next = e->next; e->next->prev = e->prev; }
static void front(LRUCache* c, Entry* e) { e->next = c->head.next; e->prev = &c->head; c->head.next->prev = e; c->head.next = e; }
LRUCache* lRUCacheCreate(int capacity) {
    LRUCache* c = malloc(sizeof *c);
    c->capacity = capacity; c->map = NULL; c->head.next = c->head.prev = &c->head;
    return c;
}
int lRUCacheGet(LRUCache* obj, int key) {
    Entry* e; HASH_FIND_INT(obj->map, &key, e);
    if (!e) return -1;
    detach(e); front(obj, e);
    return e->value;
}
void lRUCachePut(LRUCache* obj, int key, int value) {
    Entry* e; HASH_FIND_INT(obj->map, &key, e);
    if (e) { e->value = value; detach(e); front(obj, e); return; }
    if (HASH_COUNT(obj->map) == obj->capacity) { Entry* last = obj->head.prev; detach(last); HASH_DEL(obj->map, last); free(last); }
    e = malloc(sizeof *e); e->key = key; e->value = value; HASH_ADD_INT(obj->map, key, e); front(obj, e);
}
void lRUCacheFree(LRUCache* obj) {
    Entry *e, *t; HASH_ITER(hh, obj->map, e, t) { HASH_DEL(obj->map, e); free(e); }
    free(obj);
}
