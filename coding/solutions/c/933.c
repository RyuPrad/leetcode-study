typedef struct {
    int* q;
    int head;
    int tail;
    int capacity;
} RecentCounter;

RecentCounter* recentCounterCreate() {
    RecentCounter* obj = malloc(sizeof(RecentCounter));
    obj->capacity = 16;
    obj->q = malloc(obj->capacity * sizeof(int));
    obj->head = obj->tail = 0;
    return obj;
}

int recentCounterPing(RecentCounter* obj, int t) {
    if (obj->tail == obj->capacity) {
        obj->capacity *= 2;
        obj->q = realloc(obj->q, obj->capacity * sizeof(int));
    }
    obj->q[obj->tail++] = t;
    while (obj->q[obj->head] < t - 3000) obj->head++;
    return obj->tail - obj->head;
}

void recentCounterFree(RecentCounter* obj) {
    free(obj->q);
    free(obj);
}
