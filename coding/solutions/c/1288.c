static int byStartThenLonger(const void* a, const void* b) {
    const int* x = *(const int**) a;
    const int* y = *(const int**) b;
    return x[0] != y[0] ? x[0] - y[0] : y[1] - x[1];
}

int removeCoveredIntervals(int** intervals, int intervalsSize, int* intervalsColSize) {
    qsort(intervals, intervalsSize, sizeof(int*), byStartThenLonger);
    int res = 0, maxEnd = 0;
    for (int i = 0; i < intervalsSize; i++) {
        if (intervals[i][1] > maxEnd) {
            res++;
            maxEnd = intervals[i][1];
        }
    }
    return res;
}
