int minScore(int n, int** roads, int roadsSize, int* roadsColSize) {
    int* first = calloc(n + 2, sizeof(int));
    for (int i = 0; i < roadsSize; i++) {
        first[roads[i][0] + 1]++;
        first[roads[i][1] + 1]++;
    }
    for (int v = 0; v <= n; v++) first[v + 1] += first[v];
    int* fill = malloc((n + 1) * sizeof(int));
    for (int v = 0; v <= n; v++) fill[v] = first[v];
    int* to = malloc((2 * roadsSize + 1) * sizeof(int));
    int* dist = malloc((2 * roadsSize + 1) * sizeof(int));
    for (int i = 0; i < roadsSize; i++) {
        int a = roads[i][0], b = roads[i][1], d = roads[i][2];
        to[fill[a]] = b;
        dist[fill[a]++] = d;
        to[fill[b]] = a;
        dist[fill[b]++] = d;
    }
    bool* visited = calloc(n + 1, sizeof(bool));
    visited[1] = true;
    int* stack = malloc((n + 1) * sizeof(int));
    int top = 0;
    stack[top++] = 1;
    int res = INT_MAX;
    while (top > 0) {
        int node = stack[--top];
        for (int k = first[node]; k < first[node + 1]; k++) {
            if (dist[k] < res) res = dist[k];
            if (!visited[to[k]]) {
                visited[to[k]] = true;
                stack[top++] = to[k];
            }
        }
    }
    free(first);
    free(fill);
    free(to);
    free(dist);
    free(visited);
    free(stack);
    return res;
}
