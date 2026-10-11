static int byStart(const void* a, const void* b) {
    int x = (*(int* const*)a)[0], y = (*(int* const*)b)[0];
    return (x > y) - (x < y);
}

int** merge(int** intervals, int intervalsSize, int* intervalsColSize, int* returnSize, int** returnColumnSizes) {
    qsort(intervals, intervalsSize, sizeof(int*), byStart);
    int** res = malloc(intervalsSize * sizeof(int*));
    int count = 0;
    res[count++] = intervals[0];
    for (int i = 1; i < intervalsSize; i++) {
        int* last = res[count - 1];
        if (intervals[i][0] <= last[1]) {
            if (intervals[i][1] > last[1]) last[1] = intervals[i][1];
        } else {
            res[count++] = intervals[i];
        }
    }
    *returnSize = count;
    *returnColumnSizes = malloc(count * sizeof(int));
    for (int i = 0; i < count; i++) (*returnColumnSizes)[i] = 2;
    return res;
}
