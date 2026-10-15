class Solution {
    public int[] rearrangeArray(int[] nums) {
        Arrays.sort(nums);
        int[] res = new int[nums.length];
        int size = 0;
        int left = 0, right = nums.length - 1;
        while (size < nums.length) {
            res[size++] = nums[left];
            left++;
            if (left <= right) {
                res[size++] = nums[right];
                right--;
            }
        }
        return res;
    }
}
