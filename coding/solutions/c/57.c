int** insert(int** intervals, int intervalsSize, int* intervalsColSize, int* newInterval, int newIntervalSize, int* returnSize, int** returnColumnSizes) {
    int** res = malloc((intervalsSize + 1) * sizeof(int*));
    int count = 0;
    int i = 0;
    int n = intervalsSize;
    int start = newInterval[0], end = newInterval[1];
    while (i < n && intervals[i][1] < start) {
        res[count++] = intervals[i];
        i++;
    }
    while (i < n && intervals[i][0] <= end) {
        if (intervals[i][0] < start) start = intervals[i][0];
        if (intervals[i][1] > end) end = intervals[i][1];
        i++;
    }
    res[count] = malloc(2 * sizeof(int));
    res[count][0] = start;
    res[count++][1] = end;
    while (i < n) {
        res[count++] = intervals[i];
        i++;
    }
    *returnSize = count;
    *returnColumnSizes = malloc(count * sizeof(int));
    for (int k = 0; k < count; k++) (*returnColumnSizes)[k] = 2;
    return res;
}
