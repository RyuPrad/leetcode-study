class Solution {
    public int[] searchRange(long[] nums, long target) {
        int left = 0;
        int right = nums.length;
        // Lower bound: first index whose value is at least target.
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] < target) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        int first = left;
        left = 0;
        right = nums.length;
        // Upper bound: first index whose value is greater than target.
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] <= target) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        int afterLast = left;
        if (first == nums.length || nums[first] != target) {
            return new int[] { -1, -1 };
        }
        return new int[] { first, afterLast - 1 };
    }
}
