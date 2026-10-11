static int byEnd(const void* a, const void* b) {
    int x = (*(int* const*)a)[1], y = (*(int* const*)b)[1];
    return (x > y) - (x < y);
}

int eraseOverlapIntervals(int** intervals, int intervalsSize, int* intervalsColSize) {
    qsort(intervals, intervalsSize, sizeof(int*), byEnd);
    int count = 0;
    int prevEnd = intervals[0][1];
    for (int i = 1; i < intervalsSize; i++) {
        if (intervals[i][0] < prevEnd) {
            count++;
        } else {
            prevEnd = intervals[i][1];
        }
    }
    return count;
}
