class Solution {
    public int deleteAndEarn(int[] nums) {
        int max = Arrays.stream(nums).max().getAsInt();
        int[] points = new int[max + 1];
        for (int num : nums) {
            points[num] += num;
        }
        int take = 0, skip = 0;
        for (int v = 0; v <= max; v++) {
            int takeV = skip + points[v];
            skip = Math.max(skip, take);
            take = takeV;
        }
        return Math.max(take, skip);
    }
}
