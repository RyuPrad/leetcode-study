typedef struct {
    int* prefix;
    int width;
} NumMatrix;

#define PREFIX(obj, r, c) (obj)->prefix[(r) * (obj)->width + (c)]

NumMatrix* numMatrixCreate(int** matrix, int matrixSize, int* matrixColSize) {
    int m = matrixSize;
    int n = matrixColSize[0];
    NumMatrix* obj = malloc(sizeof(NumMatrix));
    obj->width = n + 1;
    obj->prefix = calloc((m + 1) * (n + 1), sizeof(int));
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            PREFIX(obj, r + 1, c + 1) =
                PREFIX(obj, r, c + 1) + PREFIX(obj, r + 1, c)
                - PREFIX(obj, r, c) + matrix[r][c];
        }
    }
    return obj;
}

int numMatrixSumRegion(NumMatrix* obj, int row1, int col1, int row2, int col2) {
    return PREFIX(obj, row2 + 1, col2 + 1)
         - PREFIX(obj, row1, col2 + 1)
         - PREFIX(obj, row2 + 1, col1)
         + PREFIX(obj, row1, col1);
}

void numMatrixFree(NumMatrix* obj) {
    free(obj->prefix);
    free(obj);
}
