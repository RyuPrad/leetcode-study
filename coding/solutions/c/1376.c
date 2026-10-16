int numOfMinutes(int n, int headID, int* manager, int managerSize, int* informTime, int informTimeSize) {
    int* first = calloc(n + 1, sizeof(int));
    for (int i = 0; i < n; i++) {
        if (manager[i] != -1) first[manager[i] + 1]++;
    }
    for (int v = 0; v < n; v++) first[v + 1] += first[v];
    int* fill = malloc(n * sizeof(int));
    for (int v = 0; v < n; v++) fill[v] = first[v];
    int* reports = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        if (manager[i] != -1) {
            reports[fill[manager[i]]++] = i;
        }
    }
    int* ids = malloc(n * sizeof(int));
    int* times = malloc(n * sizeof(int));
    int size = 0;
    ids[size] = headID;
    times[size++] = 0;
    int res = 0;
    for (int head = 0; head < size; head++) {
        int id = ids[head], time = times[head];
        if (time > res) res = time;
        for (int k = first[id]; k < first[id + 1]; k++) {
            ids[size] = reports[k];
            times[size++] = time + informTime[id];
        }
    }
    free(first);
    free(fill);
    free(reports);
    free(ids);
    free(times);
    return res;
}
