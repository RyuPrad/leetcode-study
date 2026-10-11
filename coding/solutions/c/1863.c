static int dfs(int* nums, int numsSize, int i, int xorSoFar) {
    if (i == numsSize) {
        return xorSoFar;
    }
    return dfs(nums, numsSize, i + 1, xorSoFar ^ nums[i]) + dfs(nums, numsSize, i + 1, xorSoFar);
}

int subsetXORSum(int* nums, int numsSize) {
    return dfs(nums, numsSize, 0, 0);
}
