int** generate(int numRows, int* returnSize, int** returnColumnSizes) {
    int** res = malloc(numRows * sizeof(int*));
    *returnColumnSizes = malloc(numRows * sizeof(int));
    res[0] = malloc(sizeof(int));
    res[0][0] = 1;
    (*returnColumnSizes)[0] = 1;
    for (int i = 1; i < numRows; i++) {
        int* prev = res[i - 1];
        int* row = malloc((i + 1) * sizeof(int));
        row[0] = 1;
        for (int j = 1; j < i; j++) {
            row[j] = prev[j - 1] + prev[j];
        }
        row[i] = 1;
        res[i] = row;
        (*returnColumnSizes)[i] = i + 1;
    }
    *returnSize = numRows;
    return res;
}
