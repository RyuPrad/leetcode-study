// A circular queue; push rotates the new value to the front.
typedef struct {
    int* q;
    int head;
    int size;
    int capacity;
} MyStack;

MyStack* myStackCreate() {
    MyStack* obj = malloc(sizeof(MyStack));
    obj->capacity = 128;
    obj->q = malloc(obj->capacity * sizeof(int));
    obj->head = 0;
    obj->size = 0;
    return obj;
}

static void enqueue(MyStack* obj, int x) {
    obj->q[(obj->head + obj->size) % obj->capacity] = x;
    obj->size++;
}

static int dequeue(MyStack* obj) {
    int x = obj->q[obj->head];
    obj->head = (obj->head + 1) % obj->capacity;
    obj->size--;
    return x;
}

void myStackPush(MyStack* obj, int x) {
    enqueue(obj, x);
    for (int i = 0; i < obj->size - 1; i++) {
        enqueue(obj, dequeue(obj));
    }
}

int myStackPop(MyStack* obj) {
    return dequeue(obj);
}

int myStackTop(MyStack* obj) {
    return obj->q[obj->head];
}

bool myStackEmpty(MyStack* obj) {
    return obj->size == 0;
}

void myStackFree(MyStack* obj) {
    free(obj->q);
    free(obj);
}
