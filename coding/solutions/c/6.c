char* convert(char* s, int numRows) {
    int length = strlen(s);
    char* res = malloc(length + 1);
    if (numRows == 1) {
        strcpy(res, s);
        return res;
    }
    char** rows = malloc(numRows * sizeof(char*));
    int* sizes = calloc(numRows, sizeof(int));
    for (int r = 0; r < numRows; r++) {
        rows[r] = malloc(length + 1);
    }
    int row = 0, step = 1;
    for (int i = 0; i < length; i++) {
        rows[row][sizes[row]++] = s[i];
        if (row == 0) {
            step = 1;
        } else if (row == numRows - 1) {
            step = -1;
        }
        row += step;
    }
    int k = 0;
    for (int r = 0; r < numRows; r++) {
        memcpy(res + k, rows[r], sizes[r]);
        k += sizes[r];
        free(rows[r]);
    }
    res[k] = '\0';
    free(rows);
    free(sizes);
    return res;
}
