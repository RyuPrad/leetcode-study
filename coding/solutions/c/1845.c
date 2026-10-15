typedef struct {
    int next;
    int* freed;
    int size;
} SeatManager;

SeatManager* seatManagerCreate(int n) {
    SeatManager* obj = malloc(sizeof(SeatManager));
    obj->next = 1;
    obj->freed = malloc((n + 1) * sizeof(int));
    obj->size = 0;
    return obj;
}

int seatManagerReserve(SeatManager* obj) {
    if (obj->size > 0) {
        int* heap = obj->freed;
        int top = heap[0];
        heap[0] = heap[--obj->size];
        for (int i = 0; ;) {
            int left = 2 * i + 1, right = left + 1, smallest = i;
            if (left < obj->size && heap[left] < heap[smallest]) smallest = left;
            if (right < obj->size && heap[right] < heap[smallest]) smallest = right;
            if (smallest == i) break;
            int t = heap[smallest]; heap[smallest] = heap[i]; heap[i] = t;
            i = smallest;
        }
        return top;
    }
    return obj->next++;
}

void seatManagerUnreserve(SeatManager* obj, int seatNumber) {
    int* heap = obj->freed;
    int i = obj->size++;
    heap[i] = seatNumber;
    while (i > 0 && heap[(i - 1) / 2] > heap[i]) {
        int p = (i - 1) / 2, t = heap[p]; heap[p] = heap[i]; heap[i] = t;
        i = p;
    }
}

void seatManagerFree(SeatManager* obj) {
    free(obj->freed);
    free(obj);
}
