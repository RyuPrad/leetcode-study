int* findMinHeightTrees(int n, int** edges, int edgesSize, int* edgesColSize, int* returnSize) {
    int* leaves = malloc(n * sizeof(int));
    if (n == 1) { leaves[0] = 0; *returnSize = 1; return leaves; }
    int* degree = calloc(n, sizeof(int));
    for (int e = 0; e < edgesSize; e++) { degree[edges[e][0]]++; degree[edges[e][1]]++; }
    int** adj = malloc(n * sizeof(int*));
    int* adjSize = calloc(n, sizeof(int));
    for (int i = 0; i < n; i++) adj[i] = malloc((degree[i] ? degree[i] : 1) * sizeof(int));
    for (int e = 0; e < edgesSize; e++) {
        int a = edges[e][0], b = edges[e][1];
        adj[a][adjSize[a]++] = b;
        adj[b][adjSize[b]++] = a;
    }
    int count = 0;
    for (int i = 0; i < n; i++) {
        if (degree[i] == 1) leaves[count++] = i;
    }
    int* next = malloc(n * sizeof(int));
    int remaining = n;
    while (remaining > 2) {
        remaining -= count;
        int nextCount = 0;
        for (int l = 0; l < count; l++) {
            int leaf = leaves[l];
            for (int k = 0; k < adjSize[leaf]; k++) {
                int nei = adj[leaf][k];
                degree[nei]--;
                if (degree[nei] == 1) next[nextCount++] = nei;
            }
        }
        int* swap = leaves; leaves = next; next = swap;
        count = nextCount;
    }
    for (int i = 0; i < n; i++) free(adj[i]);
    free(adj); free(adjSize); free(degree); free(next);
    *returnSize = count;
    return leaves;
}
