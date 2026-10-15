int maxSumMinProduct(int* nums, int numsSize) {
    int n = numsSize;
    long long* prefix = malloc((n + 1) * sizeof(long long));
    prefix[0] = 0;
    for (int i = 0; i < n; i++) {
        prefix[i + 1] = prefix[i] + nums[i];
    }
    int* starts = malloc((n + 1) * sizeof(int));
    int* values = malloc((n + 1) * sizeof(int));
    int top = 0;
    long long res = 0;
    for (int i = 0; i <= n; i++) {
        int value = i < n ? nums[i] : 0;
        int start = i;
        while (top > 0 && values[top - 1] > value) {
            top--;
            long long product = (long long) values[top] * (prefix[i] - prefix[starts[top]]);
            if (product > res) {
                res = product;
            }
            start = starts[top];
        }
        starts[top] = start;
        values[top] = value;
        top++;
    }
    free(prefix);
    free(starts);
    free(values);
    return (int) (res % 1000000007);
}
