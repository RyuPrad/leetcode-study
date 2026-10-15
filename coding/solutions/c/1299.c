int* replaceElements(int* arr, int arrSize, int* returnSize) {
    int rightMax = -1;
    for (int i = arrSize - 1; i >= 0; i--) {
        int current = arr[i];
        arr[i] = rightMax;
        rightMax = rightMax > current ? rightMax : current;
    }
    *returnSize = arrSize;
    return arr;
}
