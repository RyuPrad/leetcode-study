class Solution {
    public boolean checkSubarraySum(int[] nums, int k) {
        Map<Integer, Integer> firstIndex = new HashMap<>();
        firstIndex.put(0, -1);
        int sum = 0;
        for (int i = 0; i < nums.length; i++) {
            sum = (sum + nums[i]) % k;
            if (firstIndex.containsKey(sum)) {
                if (i - firstIndex.get(sum) >= 2) {
                    return true;
                }
            } else {
                firstIndex.put(sum, i);
            }
        }
        return false;
    }
}
