int* longestObstacleCourseAtEachPosition(int* obstacles, int obstaclesSize, int* returnSize) {
    int n = obstaclesSize;
    int* tails = malloc(n * sizeof(int));
    int size = 0;
    int* res = malloc(n * sizeof(int));
    for (int k = 0; k < n; k++) {
        int height = obstacles[k];
        int lo = 0, hi = size;
        while (lo < hi) {
            int mid = (lo + hi) >> 1;
            if (tails[mid] <= height) {
                lo = mid + 1;
            } else {
                hi = mid;
            }
        }
        tails[lo] = height;
        if (lo == size) size++;
        res[k] = lo + 1;
    }
    free(tails);
    *returnSize = n;
    return res;
}
