class Solution {
    public int[] searchRange(int[] nums, int target) {
        int first = bound(nums, target, true);
        int last = bound(nums, target, false);
        return new int[] { first, last };
    }

    private int bound(int[] nums, int target, boolean leftBias) {
        int left = 0, right = nums.length - 1, res = -1;
        while (left <= right) {
            int mid = (left + right) / 2;
            if (nums[mid] < target) {
                left = mid + 1;
            } else if (nums[mid] > target) {
                right = mid - 1;
            } else {
                res = mid;
                if (leftBias) {
                    right = mid - 1;
                } else {
                    left = mid + 1;
                }
            }
        }
        return res;
    }
}
