typedef struct {
    int sIn[128];
    int sOut[128];
    int inSize;
    int outSize;
} MyQueue;

MyQueue* myQueueCreate() {
    return calloc(1, sizeof(MyQueue));
}

void myQueuePush(MyQueue* obj, int x) {
    obj->sIn[obj->inSize++] = x;
}

int myQueuePeek(MyQueue* obj) {
    if (obj->outSize == 0) {
        while (obj->inSize) {
            obj->sOut[obj->outSize++] = obj->sIn[--obj->inSize];
        }
    }
    return obj->sOut[obj->outSize - 1];
}

int myQueuePop(MyQueue* obj) {
    myQueuePeek(obj);
    return obj->sOut[--obj->outSize];
}

bool myQueueEmpty(MyQueue* obj) {
    return obj->inSize == 0 && obj->outSize == 0;
}

void myQueueFree(MyQueue* obj) {
    free(obj);
}
