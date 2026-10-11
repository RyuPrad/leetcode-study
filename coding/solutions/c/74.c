bool searchMatrix(int** matrix, int matrixSize, int* matrixColSize, int target) {
    int m = matrixSize;
    int n = matrixColSize[0];
    int left = 0;
    int right = m * n - 1;
    while (left <= right) {
        int mid = (left + right) / 2;
        int val = matrix[mid / n][mid % n];
        if (val == target) {
            return true;
        } else if (val < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return false;
}
