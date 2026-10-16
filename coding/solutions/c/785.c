bool isBipartite(int** graph, int graphSize, int* graphColSize) {
    int n = graphSize;
    int* color = calloc(n, sizeof(int));
    // Every vertex is colored before it is queued, so it is queued at most once.
    int* queue = malloc(n * sizeof(int));
    int start = 0;
    while (start < n) {
        if (color[start] == 0) {
            color[start] = 1;
            int size = 0;
            queue[size++] = start;
            int head = 0;
            while (head < size) {
                int node = queue[head];
                head++;
                int i = 0;
                while (i < graphColSize[node]) {
                    int neighbor = graph[node][i];
                    if (color[neighbor] == 0) {
                        color[neighbor] = -color[node];
                        queue[size++] = neighbor;
                    } else if (color[neighbor] == color[node]) {
                        free(color);
                        free(queue);
                        return false;
                    }
                    i++;
                }
            }
        }
        start++;
    }
    free(color);
    free(queue);
    return true;
}
