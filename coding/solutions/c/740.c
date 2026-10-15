int deleteAndEarn(int* nums, int numsSize) {
    int max = 0;
    for (int i = 0; i < numsSize; i++) {
        if (nums[i] > max) max = nums[i];
    }
    int* points = calloc(max + 1, sizeof(int));
    for (int i = 0; i < numsSize; i++) {
        points[nums[i]] += nums[i];
    }
    int take = 0, skip = 0;
    for (int v = 0; v <= max; v++) {
        int takeV = skip + points[v];
        skip = skip > take ? skip : take;
        take = takeV;
    }
    free(points);
    return take > skip ? take : skip;
}
