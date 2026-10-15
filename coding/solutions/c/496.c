int* nextGreaterElement(int* nums1, int nums1Size, int* nums2, int nums2Size, int* returnSize) {
    int next[10001];
    for (int k = 0; k <= 10000; k++) next[k] = -1;
    int* stack = malloc(nums2Size * sizeof(int));
    int top = 0;
    for (int i = 0; i < nums2Size; i++) {
        int num = nums2[i];
        while (top > 0 && stack[top - 1] < num) {
            next[stack[--top]] = num;
        }
        stack[top++] = num;
    }
    int* res = malloc(nums1Size * sizeof(int));
    for (int i = 0; i < nums1Size; i++) res[i] = next[nums1[i]];
    free(stack);
    *returnSize = nums1Size;
    return res;
}
