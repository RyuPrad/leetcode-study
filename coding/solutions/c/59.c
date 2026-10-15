int** generateMatrix(int n, int* returnSize, int** returnColumnSizes) {
    int** matrix = malloc(n * sizeof(int*));
    *returnColumnSizes = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        matrix[i] = calloc(n, sizeof(int));
        (*returnColumnSizes)[i] = n;
    }
    *returnSize = n;
    int top = 0, bottom = n - 1, left = 0, right = n - 1;
    int value = 1;
    while (value <= n * n) {
        for (int c = left; c <= right; c++) {
            matrix[top][c] = value++;
        }
        top++;
        for (int r = top; r <= bottom; r++) {
            matrix[r][right] = value++;
        }
        right--;
        for (int c = right; c >= left; c--) {
            matrix[bottom][c] = value++;
        }
        bottom--;
        for (int r = bottom; r >= top; r--) {
            matrix[r][left] = value++;
        }
        left++;
    }
    return matrix;
}
