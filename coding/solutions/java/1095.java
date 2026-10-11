/**
 * // This is MountainArray's API interface.
 * // You should not implement it, or speculate about its implementation
 * interface MountainArray {
 *     public int get(int index) {}
 *     public int length() {}
 * }
 */

class Solution {
    public int findInMountainArray(int target, MountainArray arr) {
        int n = arr.length();
        int left = 0;
        int right = n - 1;
        while (left < right) {
            int mid = (left + right) / 2;
            if (arr.get(mid) < arr.get(mid + 1)) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        int peak = left;
        int res = search(arr, target, 0, peak, true);
        if (res != -1) {
            return res;
        }
        return search(arr, target, peak + 1, n - 1, false);
    }

    private int search(MountainArray arr, int target, int left, int right, boolean ascending) {
        while (left <= right) {
            int mid = (left + right) / 2;
            int value = arr.get(mid);
            if (value == target) {
                return mid;
            }
            if (ascending) {
                if (value < target) left = mid + 1;
                else right = mid - 1;
            } else {
                if (value > target) left = mid + 1;
                else right = mid - 1;
            }
        }
        return -1;
    }
}
