// Kahn's algorithm; returns the order or NULL when the conditions have a cycle.
static int* topo(int k, int** conditions, int count) {
    int* indeg = calloc(k + 1, sizeof(int));
    for (int c = 0; c < count; c++) indeg[conditions[c][1]]++;
    int* queue = malloc(k * sizeof(int));
    int head = 0, tail = 0;
    for (int i = 1; i <= k; i++) if (indeg[i] == 0) queue[tail++] = i;
    while (head < tail) {
        int node = queue[head++];
        for (int c = 0; c < count; c++) {
            if (conditions[c][0] == node && --indeg[conditions[c][1]] == 0) queue[tail++] = conditions[c][1];
        }
    }
    free(indeg);
    if (tail != k) { free(queue); return NULL; }
    return queue;
}

int** buildMatrix(int k, int** rowConditions, int rowConditionsSize, int* rowConditionsColSize, int** colConditions, int colConditionsSize, int* colConditionsColSize, int* returnSize, int** returnColumnSizes) {
    int* rowOrder = topo(k, rowConditions, rowConditionsSize);
    int* colOrder = topo(k, colConditions, colConditionsSize);
    if (!rowOrder || !colOrder) {
        free(rowOrder); free(colOrder);
        *returnSize = 0;
        *returnColumnSizes = malloc(sizeof(int));
        return malloc(sizeof(int*));
    }
    int* rowPos = malloc((k + 1) * sizeof(int));
    int* colPos = malloc((k + 1) * sizeof(int));
    for (int i = 0; i < k; i++) { rowPos[rowOrder[i]] = i; colPos[colOrder[i]] = i; }
    int** matrix = malloc(k * sizeof(int*));
    *returnColumnSizes = malloc(k * sizeof(int));
    for (int i = 0; i < k; i++) { matrix[i] = calloc(k, sizeof(int)); (*returnColumnSizes)[i] = k; }
    for (int v = 1; v <= k; v++) matrix[rowPos[v]][colPos[v]] = v;
    free(rowOrder); free(colOrder); free(rowPos); free(colPos);
    *returnSize = k;
    return matrix;
}
