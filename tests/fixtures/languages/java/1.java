class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            Integer other = seen.get(target - nums[i]);
            if (other != null) return new int[] { other, i };
            seen.put(nums[i], i);
        }
        return new int[0];
    }
}
