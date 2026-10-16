int minTime(int n, int** edges, int edgesSize, int* edgesColSize, bool* hasApple, int hasAppleSize) {
    int* first = calloc(n + 1, sizeof(int));
    for (int i = 0; i < edgesSize; i++) {
        first[edges[i][0] + 1]++;
        first[edges[i][1] + 1]++;
    }
    for (int v = 0; v < n; v++) first[v + 1] += first[v];
    int* fill = malloc(n * sizeof(int));
    for (int v = 0; v < n; v++) fill[v] = first[v];
    int* adj = malloc((2 * edgesSize + 1) * sizeof(int));
    for (int i = 0; i < edgesSize; i++) {
        adj[fill[edges[i][0]]++] = edges[i][1];
        adj[fill[edges[i][1]]++] = edges[i][0];
    }
    int* parent = malloc(n * sizeof(int));
    for (int v = 0; v < n; v++) parent[v] = -1;
    parent[0] = 0;
    int* order = malloc(n * sizeof(int));
    int size = 0;
    order[size++] = 0;
    for (int i = 0; i < size; i++) {
        for (int k = first[order[i]]; k < first[order[i] + 1]; k++) {
            int next = adj[k];
            if (parent[next] == -1) {
                parent[next] = order[i];
                order[size++] = next;
            }
        }
    }
    bool* need = malloc(n * sizeof(bool));
    for (int v = 0; v < n; v++) need[v] = hasApple[v];
    int res = 0;
    for (int i = n - 1; i > 0; i--) {
        int node = order[i];
        if (need[node]) {
            res += 2;
            need[parent[node]] = true;
        }
    }
    free(first);
    free(fill);
    free(adj);
    free(parent);
    free(order);
    free(need);
    return res;
}
