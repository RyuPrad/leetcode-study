int* findSmallestSetOfVertices(int n, int** edges, int edgesSize, int* edgesColSize, int* returnSize) {
    bool* hasIncoming = calloc(n, sizeof(bool));
    for (int i = 0; i < edgesSize; i++) {
        hasIncoming[edges[i][1]] = true;
    }
    int* res = malloc(n * sizeof(int));
    *returnSize = 0;
    for (int node = 0; node < n; node++) {
        if (!hasIncoming[node]) {
            res[(*returnSize)++] = node;
        }
    }
    free(hasIncoming);
    return res;
}
