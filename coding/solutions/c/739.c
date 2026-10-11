int* dailyTemperatures(int* temperatures, int temperaturesSize, int* returnSize) {
    int* res = calloc(temperaturesSize, sizeof(int));
    int* stack = malloc(temperaturesSize * sizeof(int));
    int top = 0;
    for (int i = 0; i < temperaturesSize; i++) {
        while (top && temperatures[i] > temperatures[stack[top - 1]]) {
            int j = stack[--top];
            res[j] = i - j;
        }
        stack[top++] = i;
    }
    free(stack);
    *returnSize = temperaturesSize;
    return res;
}
