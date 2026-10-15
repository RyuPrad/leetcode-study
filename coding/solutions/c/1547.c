static int ascending(const void* a, const void* b) {
    return *(const int*) a - *(const int*) b;
}

int minCost(int n, int* cuts, int cutsSize) {
    qsort(cuts, cutsSize, sizeof(int), ascending);
    int m = cutsSize + 2;
    int* points = malloc(m * sizeof(int));
    points[0] = 0;
    points[m - 1] = n;
    for (int i = 0; i < cutsSize; i++) {
        points[i + 1] = cuts[i];
    }
    int** dp = malloc(m * sizeof(int*));
    for (int i = 0; i < m; i++) {
        dp[i] = calloc(m, sizeof(int));
    }
    for (int gap = 2; gap < m; gap++) {
        for (int left = 0; left + gap < m; left++) {
            int right = left + gap;
            int best = INT_MAX;
            for (int mid = left + 1; mid < right; mid++) {
                if (dp[left][mid] + dp[mid][right] < best) best = dp[left][mid] + dp[mid][right];
            }
            dp[left][right] = best + points[right] - points[left];
        }
    }
    int res = dp[0][m - 1];
    for (int i = 0; i < m; i++) {
        free(dp[i]);
    }
    free(dp);
    free(points);
    return res;
}
