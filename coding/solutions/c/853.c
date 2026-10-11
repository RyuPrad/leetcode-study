static int byPositionDescending(const void* a, const void* b) {
    int x = ((const int*)a)[0], y = ((const int*)b)[0];
    return (y > x) - (y < x);
}

int carFleet(int target, int* position, int positionSize, int* speed, int speedSize) {
    int n = positionSize;
    int (*cars)[2] = malloc(n * sizeof *cars);
    for (int i = 0; i < n; i++) { cars[i][0] = position[i]; cars[i][1] = speed[i]; }
    qsort(cars, n, sizeof *cars, byPositionDescending);
    double* stack = malloc(n * sizeof(double));
    int top = 0;
    for (int i = 0; i < n; i++) {
        double time = (double)(target - cars[i][0]) / cars[i][1];
        stack[top++] = time;
        if (top >= 2 && stack[top - 1] <= stack[top - 2]) {
            top--;
        }
    }
    free(stack);
    free(cars);
    return top;
}
