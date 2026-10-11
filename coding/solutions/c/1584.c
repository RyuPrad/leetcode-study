// Prim's algorithm over the complete graph; the array form replaces the heap.
int minCostConnectPoints(int** points, int pointsSize, int* pointsColSize) {
    int n = pointsSize;
    bool* inMST = calloc(n, sizeof(bool));
    int* best = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) best[i] = INT_MAX;
    best[0] = 0;
    int total = 0;
    for (int count = 0; count < n; count++) {
        int i = -1;
        for (int j = 0; j < n; j++) if (!inMST[j] && (i < 0 || best[j] < best[i])) i = j;
        inMST[i] = true;
        total += best[i];
        for (int j = 0; j < n; j++) {
            if (!inMST[j]) {
                int d = abs(points[i][0] - points[j][0]) + abs(points[i][1] - points[j][1]);
                if (d < best[j]) best[j] = d;
            }
        }
    }
    free(inMST);
    free(best);
    return total;
}
