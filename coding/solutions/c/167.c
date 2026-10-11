int* twoSum(int* numbers, int numbersSize, int target, int* returnSize) {
    int* res = malloc(2 * sizeof(int));
    int left = 0;
    int right = numbersSize - 1;
    *returnSize = 0;
    while (left < right) {
        int sum = numbers[left] + numbers[right];
        if (sum == target) {
            res[0] = left + 1;
            res[1] = right + 1;
            *returnSize = 2;
            break;
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    return res;
}
