int* majorityElement(int* nums, int numsSize, int* returnSize) {
    int cand1 = 0, cand2 = 0;
    bool has1 = false, has2 = false;
    int count1 = 0, count2 = 0;
    for (int i = 0; i < numsSize; i++) {
        int num = nums[i];
        if (has1 && num == cand1) {
            count1++;
        } else if (has2 && num == cand2) {
            count2++;
        } else if (count1 == 0) {
            cand1 = num; has1 = true;
            count1 = 1;
        } else if (count2 == 0) {
            cand2 = num; has2 = true;
            count2 = 1;
        } else {
            count1--;
            count2--;
        }
    }
    count1 = 0;
    count2 = 0;
    for (int i = 0; i < numsSize; i++) {
        if (has1 && nums[i] == cand1) count1++;
        else if (has2 && nums[i] == cand2) count2++;
    }
    int* res = malloc(2 * sizeof(int));
    *returnSize = 0;
    if (count1 > numsSize / 3) res[(*returnSize)++] = cand1;
    if (count2 > numsSize / 3) res[(*returnSize)++] = cand2;
    return res;
}
