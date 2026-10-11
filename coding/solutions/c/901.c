typedef struct {
    int (*stack)[2]; // [price, span]
    int size;
    int capacity;
} StockSpanner;

StockSpanner* stockSpannerCreate() {
    StockSpanner* obj = malloc(sizeof(StockSpanner));
    obj->capacity = 16;
    obj->size = 0;
    obj->stack = malloc(obj->capacity * sizeof *obj->stack);
    return obj;
}

int stockSpannerNext(StockSpanner* obj, int price) {
    int span = 1;
    while (obj->size && obj->stack[obj->size - 1][0] <= price) {
        span += obj->stack[--obj->size][1];
    }
    if (obj->size == obj->capacity) {
        obj->capacity *= 2;
        obj->stack = realloc(obj->stack, obj->capacity * sizeof *obj->stack);
    }
    obj->stack[obj->size][0] = price;
    obj->stack[obj->size++][1] = span;
    return span;
}

void stockSpannerFree(StockSpanner* obj) {
    free(obj->stack);
    free(obj);
}
