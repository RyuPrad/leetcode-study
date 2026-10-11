typedef struct {
    int (*stack)[2];
    int size;
    int capacity;
} MinStack;

MinStack* minStackCreate() {
    MinStack* obj = malloc(sizeof(MinStack));
    obj->capacity = 16;
    obj->size = 0;
    obj->stack = malloc(obj->capacity * sizeof *obj->stack);
    return obj;
}

int minStackGetMin(MinStack* obj);

void minStackPush(MinStack* obj, int val) {
    int min = obj->size == 0 || val < minStackGetMin(obj) ? val : minStackGetMin(obj);
    if (obj->size == obj->capacity) {
        obj->capacity *= 2;
        obj->stack = realloc(obj->stack, obj->capacity * sizeof *obj->stack);
    }
    obj->stack[obj->size][0] = val;
    obj->stack[obj->size][1] = min;
    obj->size++;
}

void minStackPop(MinStack* obj) {
    obj->size--;
}

int minStackTop(MinStack* obj) {
    return obj->stack[obj->size - 1][0];
}

int minStackGetMin(MinStack* obj) {
    return obj->stack[obj->size - 1][1];
}

void minStackFree(MinStack* obj) {
    free(obj->stack);
    free(obj);
}
