// Sorting by (distance, x, y) gives the same order as repeatedly popping the reference's heap.
static int byDistance(const void* a, const void* b) {
    const int* p = *(int* const*)a;
    const int* q = *(int* const*)b;
    int dp = p[0] * p[0] + p[1] * p[1], dq = q[0] * q[0] + q[1] * q[1];
    if (dp != dq) return (dp > dq) - (dp < dq);
    if (p[0] != q[0]) return (p[0] > q[0]) - (p[0] < q[0]);
    return (p[1] > q[1]) - (p[1] < q[1]);
}

int** kClosest(int** points, int pointsSize, int* pointsColSize, int k, int* returnSize, int** returnColumnSizes) {
    qsort(points, pointsSize, sizeof(int*), byDistance);
    int** res = malloc(k * sizeof(int*));
    *returnColumnSizes = malloc(k * sizeof(int));
    for (int i = 0; i < k; i++) {
        res[i] = malloc(2 * sizeof(int));
        res[i][0] = points[i][0];
        res[i][1] = points[i][1];
        (*returnColumnSizes)[i] = 2;
    }
    *returnSize = k;
    return res;
}
