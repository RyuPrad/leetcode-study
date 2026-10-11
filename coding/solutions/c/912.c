static int* temp;

static void merge(int* nums, int left, int mid, int right) {
    int i = left, j = mid + 1, size = 0;
    while (i <= mid && j <= right) {
        if (nums[i] <= nums[j]) temp[size++] = nums[i++];
        else temp[size++] = nums[j++];
    }
    while (i <= mid) temp[size++] = nums[i++];
    while (j <= right) temp[size++] = nums[j++];
    memcpy(nums + left, temp, size * sizeof(int));
}

static void sort(int* nums, int left, int right) {
    if (left >= right) return;
    int mid = (left + right) / 2;
    sort(nums, left, mid);
    sort(nums, mid + 1, right);
    merge(nums, left, mid, right);
}

int* sortArray(int* nums, int numsSize, int* returnSize) {
    temp = malloc((numsSize ? numsSize : 1) * sizeof(int));
    sort(nums, 0, numsSize - 1);
    free(temp);
    *returnSize = numsSize;
    return nums;
}
