bool find132pattern(int* nums, int numsSize) {
    int* stack = malloc(numsSize * sizeof(int));
    int top = 0;
    long long third = LLONG_MIN;
    for (int i = numsSize - 1; i >= 0; i--) {
        if (nums[i] < third) {
            free(stack);
            return true;
        }
        while (top > 0 && stack[top - 1] < nums[i]) {
            third = stack[--top];
        }
        stack[top++] = nums[i];
    }
    free(stack);
    return false;
}
