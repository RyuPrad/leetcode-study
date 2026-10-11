int* spiralOrder(int** matrix, int matrixSize, int* matrixColSize, int* returnSize) {
    int* res = malloc(matrixSize * matrixColSize[0] * sizeof(int));
    int count = 0;
    int top = 0, bottom = matrixSize - 1;
    int left = 0, right = matrixColSize[0] - 1;
    while (top <= bottom && left <= right) {
        for (int j = left; j <= right; j++) res[count++] = matrix[top][j];
        top++;
        for (int i = top; i <= bottom; i++) res[count++] = matrix[i][right];
        right--;
        if (top <= bottom) {
            for (int j = right; j >= left; j--) res[count++] = matrix[bottom][j];
            bottom--;
        }
        if (left <= right) {
            for (int i = bottom; i >= top; i--) res[count++] = matrix[i][left];
            left++;
        }
    }
    *returnSize = count;
    return res;
}
