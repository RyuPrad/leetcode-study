typedef struct {
    long long time;
    int weight;
    int index;
} Server;

typedef bool (*Before)(const Server*, const Server*);

static bool lighter(const Server* a, const Server* b) {
    return a->weight < b->weight || (a->weight == b->weight && a->index < b->index);
}

static bool sooner(const Server* a, const Server* b) {
    return a->time < b->time;
}

static void push(Server* heap, int* size, Server value, Before before) {
    int i = (*size)++;
    heap[i] = value;
    while (i > 0 && before(&heap[i], &heap[(i - 1) / 2])) {
        int p = (i - 1) / 2;
        Server t = heap[p]; heap[p] = heap[i]; heap[i] = t;
        i = p;
    }
}

static Server pop(Server* heap, int* size, Before before) {
    Server top = heap[0];
    heap[0] = heap[--(*size)];
    for (int i = 0; ;) {
        int left = 2 * i + 1, right = left + 1, first = i;
        if (left < *size && before(&heap[left], &heap[first])) first = left;
        if (right < *size && before(&heap[right], &heap[first])) first = right;
        if (first == i) break;
        Server t = heap[first]; heap[first] = heap[i]; heap[i] = t;
        i = first;
    }
    return top;
}

int* assignTasks(int* servers, int serversSize, int* tasks, int tasksSize, int* returnSize) {
    Server* idle = malloc(serversSize * sizeof(Server));
    Server* busy = malloc(serversSize * sizeof(Server));
    int idleSize = 0, busySize = 0;
    for (int i = 0; i < serversSize; i++) {
        Server server = {0, servers[i], i};
        push(idle, &idleSize, server, lighter);
    }
    int* res = malloc(tasksSize * sizeof(int));
    long long time = 0;
    for (int j = 0; j < tasksSize; j++) {
        if (j > time) time = j;
        if (idleSize == 0) {
            time = busy[0].time;
        }
        while (busySize > 0 && busy[0].time <= time) {
            Server done = pop(busy, &busySize, sooner);
            push(idle, &idleSize, done, lighter);
        }
        Server server = pop(idle, &idleSize, lighter);
        res[j] = server.index;
        server.time = time + tasks[j];
        push(busy, &busySize, server, sooner);
    }
    free(idle);
    free(busy);
    *returnSize = tasksSize;
    return res;
}
