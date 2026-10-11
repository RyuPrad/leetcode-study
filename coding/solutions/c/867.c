int** transpose(int** matrix, int matrixSize, int* matrixColSize, int* returnSize, int** returnColumnSizes) {
    int m = matrixSize, n = matrixColSize[0];
    int** res = malloc(n * sizeof(int*));
    *returnColumnSizes = malloc(n * sizeof(int));
    for (int j = 0; j < n; j++) {
        res[j] = malloc(m * sizeof(int));
        (*returnColumnSizes)[j] = m;
    }
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            res[j][i] = matrix[i][j];
        }
    }
    *returnSize = n;
    return res;
}
