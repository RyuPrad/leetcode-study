int* shortestAlternatingPaths(int n, int** redEdges, int redEdgesSize, int* redEdgesColSize, int** blueEdges, int blueEdgesSize, int* blueEdgesColSize, int* returnSize) {
    int total = redEdgesSize + blueEdgesSize;
    int* first = calloc(n + 1, sizeof(int));
    for (int i = 0; i < redEdgesSize; i++) first[redEdges[i][0] + 1]++;
    for (int i = 0; i < blueEdgesSize; i++) first[blueEdges[i][0] + 1]++;
    for (int v = 0; v < n; v++) first[v + 1] += first[v];
    int* fill = malloc(n * sizeof(int));
    for (int v = 0; v < n; v++) fill[v] = first[v];
    int* to = malloc((total + 1) * sizeof(int));
    int* colorOf = malloc((total + 1) * sizeof(int));
    for (int i = 0; i < redEdgesSize; i++) {
        to[fill[redEdges[i][0]]] = redEdges[i][1];
        colorOf[fill[redEdges[i][0]]++] = 0;
    }
    for (int i = 0; i < blueEdgesSize; i++) {
        to[fill[blueEdges[i][0]]] = blueEdges[i][1];
        colorOf[fill[blueEdges[i][0]]++] = 1;
    }
    int* res = malloc(n * sizeof(int));
    for (int v = 0; v < n; v++) res[v] = -1;
    bool* seen = calloc(2 * n, sizeof(bool));
    int* queue = malloc(3 * (2 * n + 1) * sizeof(int));
    int size = 0;
    queue[size++] = 0;
    queue[size++] = -1;
    queue[size++] = 0;
    res[0] = 0;
    for (int head = 0; head < size; head += 3) {
        int node = queue[head], color = queue[head + 1], length = queue[head + 2];
        for (int k = first[node]; k < first[node + 1]; k++) {
            int next = to[k], edgeColor = colorOf[k];
            if (edgeColor != color && !seen[2 * next + edgeColor]) {
                seen[2 * next + edgeColor] = true;
                if (res[next] == -1) {
                    res[next] = length + 1;
                }
                queue[size++] = next;
                queue[size++] = edgeColor;
                queue[size++] = length + 1;
            }
        }
    }
    free(first);
    free(fill);
    free(to);
    free(colorOf);
    free(seen);
    free(queue);
    *returnSize = n;
    return res;
}
