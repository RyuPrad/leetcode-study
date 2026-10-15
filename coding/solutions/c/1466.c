int minReorder(int n, int** connections, int connectionsSize, int* connectionsColSize) {
    int* first = calloc(n + 1, sizeof(int));
    for (int i = 0; i < connectionsSize; i++) {
        first[connections[i][0] + 1]++;
        first[connections[i][1] + 1]++;
    }
    for (int v = 0; v < n; v++) first[v + 1] += first[v];
    int* fill = malloc(n * sizeof(int));
    for (int v = 0; v < n; v++) fill[v] = first[v];
    int* to = malloc((2 * connectionsSize + 1) * sizeof(int));
    int* cost = malloc((2 * connectionsSize + 1) * sizeof(int));
    for (int i = 0; i < connectionsSize; i++) {
        int a = connections[i][0], b = connections[i][1];
        to[fill[a]] = b;
        cost[fill[a]++] = 1;
        to[fill[b]] = a;
        cost[fill[b]++] = 0;
    }
    bool* visited = calloc(n, sizeof(bool));
    visited[0] = true;
    int* stack = malloc(n * sizeof(int));
    int top = 0;
    stack[top++] = 0;
    int res = 0;
    while (top > 0) {
        int node = stack[--top];
        for (int k = first[node]; k < first[node + 1]; k++) {
            if (!visited[to[k]]) {
                visited[to[k]] = true;
                res += cost[k];
                stack[top++] = to[k];
            }
        }
    }
    free(first);
    free(fill);
    free(to);
    free(cost);
    free(visited);
    free(stack);
    return res;
}
