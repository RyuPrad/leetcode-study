int* findClosestElements(int* arr, int arrSize, int k, int x, int* returnSize) {
    int left = 0;
    int right = arrSize - 1;
    while (right - left + 1 > k) {
        if (x - arr[left] > arr[right] - x) {
            left++;
        } else {
            right--;
        }
    }
    int* res = malloc(k * sizeof(int));
    memcpy(res, arr + left, k * sizeof(int));
    *returnSize = k;
    return res;
}
