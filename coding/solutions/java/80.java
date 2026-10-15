class Solution {
    public int removeDuplicates(int[] nums) {
        int left = 0;
        for (int right = 0; right < nums.length; right++) {
            if (left < 2 || nums[right] != nums[left - 2]) {
                nums[left] = nums[right];
                left++;
            }
        }
        return left;
    }
}
