bool isBipartite(int** graph, int graphSize, int* graphColSize) {
    int n = graphSize;
    int* color = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) color[i] = -1;
    int* queue = malloc(n * sizeof(int));
    bool res = true;
    for (int start = 0; start < n && res; start++) {
        if (color[start] != -1) {
            continue;
        }
        color[start] = 0;
        int size = 0;
        queue[size++] = start;
        for (int head = 0; head < size && res; head++) {
            int node = queue[head];
            for (int k = 0; k < graphColSize[node]; k++) {
                int next = graph[node][k];
                if (color[next] == -1) {
                    color[next] = 1 - color[node];
                    queue[size++] = next;
                } else if (color[next] == color[node]) {
                    res = false;
                    break;
                }
            }
        }
    }
    free(color);
    free(queue);
    return res;
}
