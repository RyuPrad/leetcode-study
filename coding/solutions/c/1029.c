static int bySaving(const void* a, const void* b) {
    const int* x = *(const int**) a;
    const int* y = *(const int**) b;
    return (x[0] - x[1]) - (y[0] - y[1]);
}

int twoCitySchedCost(int** costs, int costsSize, int* costsColSize) {
    qsort(costs, costsSize, sizeof(int*), bySaving);
    int n = costsSize / 2;
    int res = 0;
    for (int i = 0; i < n; i++) {
        res += costs[i][0] + costs[n + i][1];
    }
    return res;
}
