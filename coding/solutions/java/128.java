class Solution {
    public int longestConsecutive(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        for (int num : nums) seen.add(num);
        int ans = 0;
        for (int num : seen) {
            if (!seen.contains(num - 1)) {
                int curr = num;
                int length = 1;
                while (seen.contains(curr + 1)) {
                    curr++;
                    length++;
                }
                ans = Math.max(ans, length);
            }
        }
        return ans;
    }
}
