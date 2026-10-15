int* eventualSafeNodes(int** graph, int graphSize, int* graphColSize, int* returnSize) {
    int n = graphSize, edges = 0;
    for (int node = 0; node < n; node++) edges += graphColSize[node];
    int* first = calloc(n + 1, sizeof(int));
    for (int node = 0; node < n; node++) {
        for (int k = 0; k < graphColSize[node]; k++) {
            first[graph[node][k] + 1]++;
        }
    }
    for (int node = 0; node < n; node++) first[node + 1] += first[node];
    int* fill = malloc(n * sizeof(int));
    for (int node = 0; node < n; node++) fill[node] = first[node];
    int* reverse = malloc((edges + 1) * sizeof(int));
    int* outDegree = malloc(n * sizeof(int));
    for (int node = 0; node < n; node++) {
        outDegree[node] = graphColSize[node];
        for (int k = 0; k < graphColSize[node]; k++) {
            reverse[fill[graph[node][k]]++] = node;
        }
    }
    int* queue = malloc(n * sizeof(int));
    int size = 0;
    for (int node = 0; node < n; node++) {
        if (outDegree[node] == 0) {
            queue[size++] = node;
        }
    }
    bool* safe = calloc(n, sizeof(bool));
    for (int head = 0; head < size; head++) {
        int node = queue[head];
        safe[node] = true;
        for (int k = first[node]; k < first[node + 1]; k++) {
            int prev = reverse[k];
            outDegree[prev]--;
            if (outDegree[prev] == 0) {
                queue[size++] = prev;
            }
        }
    }
    int* res = malloc(n * sizeof(int));
    *returnSize = 0;
    for (int node = 0; node < n; node++) {
        if (safe[node]) {
            res[(*returnSize)++] = node;
        }
    }
    free(first);
    free(fill);
    free(reverse);
    free(outDegree);
    free(queue);
    free(safe);
    return res;
}
