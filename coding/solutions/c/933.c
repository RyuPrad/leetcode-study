typedef struct {
    int* queue;
    int head;
    int tail;
    int capacity;
} RecentCounter;

RecentCounter* recentCounterCreate() {
    RecentCounter* obj = malloc(sizeof(RecentCounter));
    obj->capacity = 16;
    obj->queue = malloc(obj->capacity * sizeof(int));
    obj->head = obj->tail = 0;
    return obj;
}

int recentCounterPing(RecentCounter* obj, int t) {
    if (obj->tail == obj->capacity) {
        obj->capacity *= 2;
        obj->queue = realloc(obj->queue, obj->capacity * sizeof(int));
    }
    obj->queue[obj->tail++] = t;
    while (obj->tail > obj->head && obj->queue[obj->head] < t - 3000) {
        obj->head++;
    }
    return obj->tail - obj->head;
}

void recentCounterFree(RecentCounter* obj) {
    free(obj->queue);
    free(obj);
}
