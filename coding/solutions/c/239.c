int* maxSlidingWindow(int* nums, int numsSize, int k, int* returnSize) {
    int* res = malloc((numsSize - k + 1) * sizeof(int));
    int* deque = malloc(numsSize * sizeof(int));
    int head = 0, tail = 0, count = 0;
    for (int right = 0; right < numsSize; right++) {
        while (tail > head && nums[deque[tail - 1]] < nums[right]) {
            tail--;
        }
        deque[tail++] = right;
        if (deque[head] <= right - k) {
            head++;
        }
        if (right >= k - 1) {
            res[count++] = nums[deque[head]];
        }
    }
    free(deque);
    *returnSize = count;
    return res;
}
