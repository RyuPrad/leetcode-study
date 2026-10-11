class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();

        for (int i = 0; i < nums.length; i++) {
            int num = nums[i];
            int need = target - num;

            if (seen.containsKey(need)) {
                return new int[] { seen.get(need), i };
            }

            seen.put(num, i);
        }
        return new int[0];
    }
}
