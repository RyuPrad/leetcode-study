class Solution {
    public int splitArray(int[] nums, int k) {
        int left = Arrays.stream(nums).max().getAsInt();
        int right = Arrays.stream(nums).sum();
        int ans = right;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            int pieces = 1;
            int cur = 0;
            for (int num : nums) {
                if (cur + num > mid) {
                    pieces++;
                    cur = 0;
                }
                cur += num;
            }
            if (pieces <= k) {
                ans = mid;
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        return ans;
    }
}
